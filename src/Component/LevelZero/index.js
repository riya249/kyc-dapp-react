import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage, useFormik } from 'formik';
import Swal from 'sweetalert2';
import { UserContext } from '../../utils/user.context';
import { Link } from 'react-router-dom';
import { kycInst, providerESN } from '../../ethereum';
import { ethers } from 'ethers';
import { parseEthersJsError } from 'eraswap-sdk/dist/utils';

export default class LevelZero extends React.Component {
  validationSchema = {};
  static contextType = UserContext;
  activePlatformId = '';
  level = 0;

  constructor(props) {
    super(props);
    this.state = {
      isKycApplied: false,
      kycFee: '0x0',
      username: ''
    };

    this.validationSchema = {
      username: Yup.string()
        .required('User name is required')
        .matches(/^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,'Username should be atleast 8 characters and should not contain any special characters or space in between'),
      kycFee: Yup.string()
        .required('Kyc Fees is required')
        .test('formatKycFee',
        'Invalid Fee',
        value =>isFinite(value)),
    }
  }

  componentDidMount() {
    this.fetchKycDetails();
    this.fetchKycFee();
  }

  async fetchKycFee(){
    try{
      const kycFee = await kycInst.getKycFee('1',ethers.utils.formatBytes32String(0),ethers.utils.formatBytes32String(0))
      this.setState({ kycFee });
    }catch(e){
      console.log(e);
    }
  }

  async fetchKycDetails(){
    try {
      const username = await kycInst.resolveUsernameStrict(this.context.user.wallet.address);
      this.setState({
        isKycApplied: true,
        username: ethers.utils.parseBytes32String(username)
      });
    } catch (error) { }
  }

  submitLevelZero = async (values, { setSubmitting }) => {
    try{
      const walletInst = this.context.user.wallet.connect(providerESN);
      const tx = await kycInst.connect(walletInst).register(ethers.utils.formatBytes32String(values.username),{ value: ethers.utils.parseEther(values.kycFee) })
      await tx.wait();
      this.setState({ isKycApplied : true });
      Swal.fire('Success','You have successfully registered on KYC Dapp','success');
    }catch(e){
      console.log(e);
      const error = parseEthersJsError(e);
      Swal.fire('Oops',error,'error');
    }
    setSubmitting(false)
  }

  render() {
    return (
      <div>
        <h4 className="m4-txt-level mb40 text-center">KYC LEVEL   0 </h4>

        {this.state.isKycApplied ?
          <div className="alert alert-info">KYC Applied, you can proceed to <Link className="btn btn-link" to={`/${this.props.match.url.split('/')[1]}/1`}>Step 1</Link></div>
        : null}
        <span className="level-info" style={{ color: 'darkblue' }}>
          {//info here
          }
        </span>
        <br></br>
        <br></br>
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
                  KYC Level  0 information
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


        <div>
          <Formik
            enableReinitialize={true}
            initialValues={{
              username: this.state.username,
              kycFee: ethers.utils.formatEther(this.state.kycFee)
            }}
            validationSchema={Yup.object().shape(this.validationSchema)}

            onSubmit={(values, { setSubmitting }) => this.submitLevelZero(values, { setSubmitting })}
          >
            {({
              errors,
              touched,
              values,
              setFieldValue,
              handleChange,
              isSubmitting
            }) => {
              console.log({errors});
              return (
                <Form autoComplete={false}>
                  <fieldset class="scheduler-border">
                    <legend class="scheduler-border">Registration</legend>
                    <div className="form-row">
                      <div className="form-group col-lg-3">
                        <label htmlFor="username">Username*</label>
                        <Field
                          disabled={this.state.isKycApplied}
                          value={values?.username}
                          name="username"
                          type="text"
                          autoComplete="none"
                          placeholder="Username"
                          className={
                            'form-control' +
                            (errors.username && touched.username
                              ? ' is-invalid'
                              : '')
                          }
                        />
                        <ErrorMessage
                          name="username"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>
                      <div className="form-group col-lg-3">
                        <label htmlFor="kycFee">KYC Fees*</label>
                        <Field
                          disabled={true}
                          value={values?.kycFee}
                          name="kycFee"
                          type="text"
                          autoComplete="none"
                          placeholder="Kyc Fees"
                          className={
                            'form-control' +
                            (errors.kycFee && touched.kycFee
                              ? ' is-invalid'
                              : '')
                          }
                        />
                        <ErrorMessage
                          name="kycFee"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>
                      <div className="form-group col-lg-3">
                        <br></br>
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={isSubmitting || this.state.isKycApplied}
                        >{isSubmitting ? 'Processing' : 'Register'}</button>
                      </div>
                    </div>
                  </fieldset>
                </Form>
              )
            }}
          </Formik>
        </div>
        {
        this.state.isKycApplied
        ?
          <Link className="btn btn-primary" to={`/${this.props.match.url.split('/')[1]}/1`}>Next</Link>
        :
          null
        }
      </div>
    );
  }
}
