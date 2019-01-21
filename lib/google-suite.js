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

  try{
    const authRes = await jwt.authorize();
    //console.log("auth: " + JSON.stringify(authRes));
  }catch(AuthError){
    console.log("Authentication error!");
    throw { errors: [{message: "Authentication errorrrr"}], code: 500 };
  }

    const res = await operation(jwt, payload);
    const operationResult = {success: true, code: res.status, data: res.data};
    if( operation.name.indexOf("add") > -1 && operationResult.code === 200) { operationResult.code = 201 };
    if( operationResult.code === 204) { operationResult.code = 200 };
  
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

  // Delete the group
  deleteGroup: async function deleteGroup(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.groups.delete({
        groupKey: data.primaryEmail,
        auth: jwt
      });
    return result;
  },

   // Insert user account in the system
  addAccount: async function addAccount(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.users.insert({
      requestBody: data,
      auth: jwt
    });

    return result;
  },

  // Delete the account
  deleteAccount: async function deleteaccount(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.users.delete({
        userKey: data.primaryEmail,
        auth: jwt
      });
    return result;
  },

  // Insert member in Google group
  addUserInGroup: async function addUserInGroup(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.members.insert({
        groupKey: data.primaryEmail,
        requestBody: {
          email: data.userName,
        },
        auth: jwt
      });
      return result;
  },

  // Remove member from Google group
  removeUserFromGroup: async function removeUserFromGroup(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.members.delete({
        groupKey: data.primaryEmail,
        memberKey: data.userName,
        auth: jwt
      });

      return result;
  },


  // Update password of user
  updatePassword: async function updatePassword(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.users.patch({
        userKey: data.primaryEmail,
        requestBody: {
          password: data.newPassword,
        },
        auth: jwt
      });
      return result;
  },

  // Update picture of user
  updatePic: async function updatePic(jwt, data){ 
    const admin = google.admin('directory_v1');
    const result = await admin.users.photos.update({
        userKey: data.primaryEmail,
        requestBody: {
          photoData: data.newPhoto, //web safe base64 encoded photo data
        },
        auth: jwt
      });
      return result;
  },

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

}

exports.runGsuiteOperation = runGsuiteOperation;
exports.gsuiteOperations = gsuiteOperations;
