/* eslint-disable camelcase */
const axios = require('axios');
const request = require('request');

exports.facebook = async (access_token) => {
  const fields = 'id, name, email, picture';
  const url = 'https://graph.facebook.com/me';
  const params = {access_token, fields};
  const response = await axios.get(url, {params});
  const {
    id, name, email, picture
  } = response.data;
  return {
    service: 'facebook',
    picture: picture.data.url,
    id,
    name,
    email
  };
};

exports.google = async (access_token) => {
  const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
  const params = {access_token};
  const response = await axios.get(url, {params});
  const {
    sub, name, email, picture
  } = response.data;
  return {
    service: 'google',
    picture,
    id: sub,
    name,
    email
  };
};


exports.payment = async (accessToken, body) => {
  const paymentHost = process.env.PAYMENT_URI || 'http://localhost:4000';
  const url = `${paymentHost}/v1/payment`;

  const headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'content-type': 'application/json',
    Authorization: accessToken
  };

  const options = {
    url,
    method: 'POST',
    headers,
    body,
    json: true
  };

  return request(options, (error, response, data) => {
    return data;
  });
};
