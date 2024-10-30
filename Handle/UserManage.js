const mongoose = require('mongoose');
const { mongooseData } = require('../users/user');
const User = mongoose.model('User', mongooseData);

let allUserIds = [];
let allUserIdsRank = [];

async function initializeUserIds() {
    try{
        const allUsers = await User.find({}, 'userId');
        allUserIds = allUsers.map(user => user.userID);

        allUsers.forEach(async user => {
            const userData = await User.findOne({ userID: user.userID });
        });

    }catch(error){
        console.error('Error initializing user IDs:', error);
    }
}

function getAllUserIds(){
    return allUserIds;
}

function getAllUserIdsRank(){
    return allUserIdsRank;
}

module.exports = { initializeUserIds, getAllUserIds, getAllUserIdsRank };
