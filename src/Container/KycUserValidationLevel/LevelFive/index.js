import React from 'react';
import Images from '../../../Container/Images/Images';
import User from '../../../models/User';
import Swal from 'sweetalert2';
import { PRESET, ACCEPT_ESN, REJECT_ESN, ACCEPT_PRESET, REJECT_PRESET } from '../../../utils/constants';
import Axios from 'axios';
import config from '../../../config/config';
import { handleError } from '../../../utils/Apis';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage, useFormik } from 'formik';
import { Col, Row, Modal, Button } from 'react-bootstrap';
import CustomFileInput from '../../../Component/CustomFileInput/CustomFileInput';
import { SUPPORTED_FORMATS, FILE_SIZE } from '../../../utils/constants';
import { UserContext } from '../../../utils/user.context';
import { Link } from 'react-router-dom';

export default class LevelFive extends React.Component {
  static contextType = UserContext;
  activePlatformId = '';
  level = 5;

  constructor(props) {
    super(props);
    this.state = {
      platforms: [],
      inputs: [],
      initialValues: {},
      validationSchema: {},
      kycData: {},
      show: false,
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    this.fetchPlatforms();
  }

  fetchInputs(platformId) {
    console.log('platformId', platformId);
    this.activePlatformId = platformId;
    console.log('this.activePlatformId', this.activePlatformId);
    this.handleShow();
    Axios.get(config.baseUrl + `api/kyc-inputs/?platformId=${platformId}&level=${this.level}`)
      .then((resp) => {
        console.log('inputs', resp);
        this.setState({
          inputs: resp.data.data,
        });

        const textValidator = (name) =>
          Yup.string().required(`${name} is required`);

        const fileValidator = (name, title) =>
          Yup.mixed()
            .test(`${name}Required`, `${title} is required`, (value) => value)
            .test(
              `${name}Size`,
              'File is too large',
              (value) => value && value.size <= FILE_SIZE
            )
            .test(
              `${name}Format`,
              'Unsupported Format',
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .required(`${title}  is required`);

        const validationSchema = {},
          initialValues = {};
        resp.data.data.forEach((input, i) => {
          validationSchema[input._id] =
            input.type === 'file'
              ? fileValidator(input._id, input.name)
              : textValidator(input.name);

          initialValues[input._id] = '';
        });

        this.setState({
          validationSchema,
          initialValues,
        });

        this.fetchSubmittedData();
      })
      .catch(handleError);
  }

  fetchSubmittedData() {
    Axios.get(config.baseUrl + `apis/kyc-level-two/${this.level}/${this.activePlatformId}`, {
      headers: {
        Authorization: this.context?.user?.token,
      },
    })
      .then((resp) => {
        console.log('fetch platform data', resp);
        const kycData = {},
          validationSchema = this.state.validationSchema;
        resp.data.data.documents.forEach((document, i) => {
          kycData[document.documentId._id] = document.content;
          if (document.documentId.type === 'file')
            delete validationSchema[document.documentId._id];
        });
        console.log('kycData', kycData);
        this.setState({
          kycData,
          initialValues: kycData,
          kycStatus: resp.data.data.status,
          adminMessage: resp.data.data.adminMessage,
        });
      })
      .catch(handleError);
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  fetchPlatforms() {
    Axios.get(config.baseUrl + `api/kyc-platforms/?level=${this.level}`)
      .then((resp) => {
        console.log(resp);

        this.setState({
          platforms: resp.data.data,
        });
      })
      .catch(handleError);
  }

  submitLevelTwo(values, { setSubmitting }) {
    console.log('called');
    const formData = new FormData();
    formData.append('platformId', this.activePlatformId);
    formData.append('level', this.level);

    for (var key in values) {
      formData.append(key, values[key]);
      console.log(formData.get(key));
    }

    Axios.post(config.baseUrl + 'apis/kyc-level-two/save', formData, {
      headers: {
        Authorization: this.context?.user?.token,
      },
    })
      .then((resp) => {
        console.log(resp);
        Swal.fire('Success', resp.data.message, 'success');
        setSubmitting(false);
      })
      .catch(handleError);
  }

  render() {
    return (
      <div>
        <h4 className="m4-txt-level mb40 text-center">KYC LEVEL 5</h4>
        <span className="level-info" style={{color: 'darkblue',}}>

          1. In KYC Level 5, a member can apply for Curator Validation by giving required charges. <br></br>
          2.  A member can become Curator for KYC verification in Era Swap Ecosystem. <br></br>
          3.  The charges for Level 5 KYC will be applicable from 21st of August 2020 onwards.<br></br>
          4.  Fill the details and click on 'Submit' Button.<br></br>
        </span>
        <br></br>
        <br></br>
        <div className="text-center mb30">
          <p>Please Complete Your Level 1 & 2 KYC for Verification of Identity, If already done then Proceed with Level 5  as EXPERT of Online Verification and Dispute resolution - CURATOR</p>
          <button type="submit" class="btn btn-primary mr-2">Go to Level 1</button>
        </div>
        {/* <!-- info modall start here--> */}
        <div
          class="modal fade kyclevel2"
          tabindex="-1"
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">
                  KYC Level  5 information
                </h5>
                <button
                  type="button"
                  class="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <h6>KYC on Blockchain Network Done More Quickly & Securly</h6>
                <p>
                  KYC DApp is powered on a decentralised network of Era Swap.
                  There is no centralized authority to obstructions means
                  inbuilt immutably that makes contained data more trustworthy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- info modall end here--> */}
        <fieldset class="scheduler-border">
          <legend class="scheduler-border">
            Others Platforms Document Submission
          </legend>

          <Row className="mt20">
            {this.state.platforms.length ? (
              this.state.platforms.map((platform, i) => (
                <Col lg={3} md={6} sm={12} key={i}>
                  <div
                    className="jm-logo"
                    onClick={this.fetchInputs.bind(this, platform._id)}
                  >
                    <span>
                      <img
                        className="Img"
                        src={platform.logo}
                        alt={platform.name}
                      />
                    </span>
                  </div>
                </Col>
              ))
            ) : (
              <div className="text-center">No Platforms Listed Yet</div>
            )}
          </Row>
        </fieldset>

        <Modal size="lg" show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <h5 class="modal-title" id="exampleModalLabel">
              ERASWAP Network
            </h5>
          </Modal.Header>
          <Modal.Body>
            <fieldset class="scheduler-border">
              <legend class="scheduler-border">Document Submission</legend>
              {/* <hr className="bg-color--primary border--none  jsElement dash-red" data-height="3" data-width="80" /> */}
              {this.state.kycStatus === 'approved' ? (
                <div className="kycapprove mb40 col-md-8 mx-auto ">
                  <h3>
                    <i class="fa fa-check-square-o fa-6" aria-hidden="true"></i>
                    Your Kyc has verified by curators
                  </h3>
                  <p>
                    KYC DApp is powered on a decentralised network of Era Swap.
                    There is no centralized authority to obstructions means
                    inbuilt immutably that makes contained data more
                    trustworthy.
                  </p>
                </div>
              ) : this.state.kycStatus === 'rejected' ? (
                <div className="kycrejected mb40 col-md-8 mx-auto ">
                  <h3>
                    <i class="fa fa-times fa-6" aria-hidden="true"></i>
                    Your KYC Has been Rejected by curators
                  </h3>
                  {this.state.adminMessage && (
                    <span>
                      <hr />
                      {this.state.adminMessage}
                      <hr />
                    </span>
                  )}
                  <p>
                    KYC DApp is powered on a decentralised network of Era Swap.
                    There is no centralized authority to obstructions means
                    inbuilt immutably that makes contained data more
                    trustworthy.
                  </p>
                </div>
              ) : this.state.kycStatus === 'pending' ? (
                <div className="kycrejected mb40 col-md-8 mx-auto ">
                  <h3>Pending</h3>
                  <p>
                    KYC DApp is powered on a decentralised network of Era Swap.
                    There is no centralized authority to obstructions means
                    inbuilt immutably that makes contained data more
                    trustworthy.
                  </p>
                </div>
              ) : null}

              <Formik
                enableReinitialize={true}
                initialValues={this.state.initialValues}
                validationSchema={Yup.object().shape(
                  this.state.validationSchema
                )}
                onSubmit={(values, { setSubmitting }) =>
                  this.submitLevelTwo(values, { setSubmitting })
                }
              >
                {({ errors, touched, values, setFieldValue, isSubmitting }) => (
                  <Form>
                    <Row className="mt20">
                      {this.state.inputs.map((input, i) => (
                        <Col sm={input.type === 'text' ? 12 : 6} key={i}>
                          <Field
                            type={input.type}
                            id={input._id}
                            name={input._id}
                            title={input.name}
                            description={input?.description}
                            component={CustomFileInput}
                            setFieldValue={setFieldValue}
                            placeholder={String('Enter the ').concat(
                              input.name
                            )}
                            touched={touched}
                            errors={errors}
                            value={
                              values && values[input._id]
                                ? values[input._id]
                                : ''
                            }
                          />
                        </Col>
                      ))}
                    </Row>
                    <Row className="mt20">
                      <div className="submit-btn-flex">
                        <button className="submit-btn" type="submit">
                          {isSubmitting ? 'Submitting' : 'Submit'}
                        </button>
                      </div>
                    </Row>
                  </Form>
                )}
              </Formik>
            </fieldset>
          </Modal.Body>
        </Modal>
        <Link className="btn btn-primary" to={`/${this.props.match.url.split('/')[1]}/4`}>Prev</Link>
      </div>
    );
  }
}
