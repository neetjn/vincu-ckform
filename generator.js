const fs = require('fs')
const path = require ('path')
const riot = require('riot')
const hbs = require('handlebars')
const aws = require('aws-sdk')
const uuidv4 = require('uuid/v4')

// # setup aws clients
aws.config.update(require('./aws.config.json'))
s3 = new aws.S3()

// # compile component and drop to local file system
const tag = fs.readFileSync(path.join(__dirname, 'src/vv-ckform.tag'))
const component = riot.compile(tag.toString('utf8'))
fs.writeFileSync(path.join(__dirname, 'dist/vv-ckform.js'), component, 'utf8')


var params = {
  Bucket: 'vincuventas',
  Key: `vv-ckform-${uuidv4().toString('utf8')}.js`,
  Body: component,
  ACL: 'public-read'
}
var options = { partSize: 10 * 1024 * 1024, queueSize: 1 }
// # upload component to s3
s3.upload(params, options, (error, data) => {
  // # generate our wp post html
  const source = fs.readFileSync(path.join(__dirname, 'templates/vv-ckform.hbs')).toString('utf8')
  const template = hbs.compile(source)({ component: data.Location })
  fs.writeFileSync(path.join(__dirname, 'dist/vv-ckform.html'), template, 'utf8')
})
