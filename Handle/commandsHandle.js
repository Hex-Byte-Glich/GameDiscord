const fs = require('fs');
const { getFiles } = require('../Functions/function');

const slashCommands = fs.readdirSync('./CommandSlash').filter(file => file.endsWith('.js'));
const getSlashCommands = getFiles(slashCommands, '../CommandSlash');

//sending file
const coreFile = fs.readdirSync('./commands/core').filter(file => file.endsWith('.js'));
const adminFile = fs.readdirSync('./commands/Admin').filter(file => file.endsWith('.js'));
const securityFile = fs.readdirSync('./commands/security').filter(file => file.endsWith('.js'));

//getfile
const getCore = getFiles(coreFile, '../commands/core');
const getAdmin = getFiles(adminFile, '../commands/Admin');
const getSecurity = getFiles(securityFile, '../commands/security');

module.exports = { 
    getCore,
    getSlashCommands,
    getAdmin,
    getSecurity };