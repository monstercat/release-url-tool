#!/usr/bin/env node

var getUrl = require('monstercat-release-url')


var mongojs = require('mongojs')
var aws     = require('aws-sdk')
var ms      = require('ms')
var argv    = require('minimist')(process.argv.slice(2))

var cs = process.env.MONSTERCAT_MONGO_CS || 'test';
var db = mongojs(cs, ['ReleasePackage'])
var client = new aws.S3()

var format = argv.f || 'mp3';
var expires = argv.e;
var quality = argv.q || 0;
var bitRate = argv.b;
var releaseId = argv.r;
var awsParams = {};
if (expires != null) {
  awsParams.Expires = ms(expires) / 1000;
}

var releaseParams = { format: format };
if (bitRate != null) releaseParams.bitRate = bitRate;
if (quality != null) releaseParams.quality = quality;

if (!(bitRate == null || quality == null))
  fail('-b <bitrate> or -q <quality> required')

if (releaseId == null)
  fail('-r <releaseId> required')

var params = {
  ReleasePackage: db.ReleasePackage,
  client: client,
  releaseId: mongojs.ObjectId(releaseId),
  releaseParams: releaseParams,
  awsParams: awsParams
};

getUrl(params, function (err, url) {
  if (err) fail(err)
  console.log(url);
  db.close();
})

function fail(msg) {
  console.error(msg)
  console.error("")
  usage();
  process.exit(1);
}


function usage() {
  console.error("usage: monstercat-release-url [options]")
  console.error("")
  console.error("required:")
  console.error("")
  console.error("  -f {mp3,flac,wav}")
  console.error("  -q {0,2} or -b {320,128}")
  console.error("  -r releaseId")
  console.error("")
  console.error("optional:")
  console.error("  -e expires   eg. 1m, 10h, 5s, 1d")
}
