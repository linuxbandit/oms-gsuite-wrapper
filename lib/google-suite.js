// Copyright 2014-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {google} = require('googleapis');
const config = require('./config/configFile.js');


// Create JWT auth object
const jwt = new google.auth.JWT(
  config.GsuiteKeys.client_email,
  null,
  config.GsuiteKeys.private_key,
  [
    'https://www.googleapis.com/auth/admin.directory.group',
    'https://www.googleapis.com/auth/admin.directory.group.member',
    'https://www.googleapis.com/auth/admin.directory.user',
  ],
  config.GsuiteKeys.delegatedUser,
);

async function runGsuiteOperation(operation, payload) {

  let operationResult;
  try{
    const authRes = await jwt.authorize();
    //console.log("auth: " + JSON.stringify(authRes));
  }catch(AuthError){
    console.log("Authentication error!");
    throw { errors: [{message: "Authentication errorrrr"}], code: 500 };
  }

    const res = await operation(jwt, payload);
    operationResult = {success: true, code: res.status, data: res.data};
    if( operation.name.indexOf("add") > -1 && operationResult.code === 200) { operationResult.code = "201" };
  
  return operationResult;
};


const gsuiteOperations = {

  // Insert group in the system
  addGroup: async function addGroup(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.groups.insert({
        requestBody: {
            name: data.groupName, 
            email: data.primaryEmail,
        },
        auth: jwt
      });
    return result;
  },

  // Delete the group key
  deleteGroup: async function deleteGroup(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.groups.delete({
        groupKey: data.groupName,
        auth: jwt
      })
      return result;
  },

  // // Insert user in the system
  // addUser: function addUser(jwt, data){ 
  //   const admin = google.admin('directory_v1');
  //   admin.user.insert({
  //     requestBody: {
  //       "primaryEmail": "testapi@aegee.eu",
  //       "name": {
  //       "givenName": "Test", //EXT
  //       "familyName": "API" //EXT
  //       },
  //       "password": "pinolo89", //EXT
  //       //"hashFunction": "bcrypt",
  //       "emails": [
  //       {
  //         "address": "fabrifaa@gmail.com", //EXT
  //         "type": "home",
  //         "customType": "",
  //         "primary": true
  //       }
  //       ],
  //       "orgUnitPath": "/individuals",
  //       "includeInGlobalAddressList": true
  //     },
  //     auth: jwt
  //   },
  //   (err, data) => {
  //     if (err){
  //       console.log("OHNO: error code " + err.code + " on subject " +err.config.data +"; what went wrong: "+ err.errors[0].message);
  //       return err.config.data;
  //     }else {
  //       console.log("Status: " + data.status + "; Response: " + JSON.stringify(data.data) );
  //       return data.data
  //     }
  //   })
  // },

  // // Insert group in the system
  // addGroup: function addGroup(jwt, data){ 
  //   const admin = google.admin('directory_v1');
  //   admin.groups.insert({
  //       requestBody: {
  //         email: data.groupName,
  //       },
  //       auth: jwt
  //     },
  //     (err, data) => {
  //       if (err){
  //         console.log("OHNO: error code " + err.code + " on subject " +err.config.data +"; what went wrong: "+ err.errors[0].message);
  //       }else {
  //         console.log("Status: " + data.status + "; Response: " + JSON.stringify(data.data) );
  //         return data.data
  //       }
  //     })
  // },

  // // delete the group key
  // deleteGroup: function deleteGroup(jwt, data){ 
  //   const admin = google.admin('directory_v1');
  //   admin.groups.delete({
  //       groupKey: data.groupName,
  //       auth: jwt
  //     },
  //     (err, data) => {
  //       if (err){
  //         console.log("OHNO: error code " + err.code + " on subject " +err.config.data +"; what went wrong: "+ err.errors[0].message);
  //       }else {
  //         console.log("Status: " + data.status + "; Response: " + JSON.stringify(data.data) );
  //         return data.data
  //       }
  //     })
  // },

  // // Insert member in Google group
  // addUserInGroup: function addUserInGroup(jwt, data){ 
  //   const admin = google.admin('directory_v1');
  //   admin.members.insert({
  //       groupKey: data.groupName,
  //       requestBody: {
  //         email: data.userName,
  //       },
  //       auth: jwt
  //     },
  //     (err, data) => {
  //       if (err){
  //         console.log("OHNO: error code " + err.code + " on subject " +err.config.data +"; what went wrong: "+ err.errors[0].message);
  //       }else {
  //         console.log("Status: " + data.status + "; Response: " + JSON.stringify(data.data) );
  //         return data.data
  //       }
  //     })
  // },

  // // Delete member from Google group
  // deleteUserFromGroup: function deleteUserFromGroup(jwt, data){ 
  //   const admin = google.admin('directory_v1');
  //   admin.members.delete({
  //       groupKey: data.groupName,
  //       memberKey: data.userName,
  //       auth: jwt
  //     },
  //     (err, data) => {
  //       if (err){
  //         console.log("OHNO: error code " + err.code + " on subject " +err.config.data +"; what went wrong: "+ err.errors[0].message);
  //       }else {
  //         console.log("Status: " + data.status + "; Response: " + JSON.stringify(data.data) );
  //         return data.data
  //       }
  //     })
  // }

}

exports.runGsuiteOperation = runGsuiteOperation;
exports.gsuiteOperations = gsuiteOperations;