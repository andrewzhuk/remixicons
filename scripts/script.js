const prompt = require('prompt');
const request = require('superagent');
const fs = require('fs');

const admZip = require('adm-zip');
const properties = [
  {
    name: 'version',
    validator: /^[0-9]*\.?[0-9]\.?[0-9]*$/,
    warning: 'Version must be only digits separated by dots ex: 2.5.0',
  }
];

prompt.start();

prompt.get(properties, function (err, result) {
  if (err) {
    return onErr(err);
  }
  const version = result.version;
  const href = `https://github.com/Remix-Design/RemixIcon/releases/download/v${version}`;
  const zipFile = `RemixIcon_SVG_v${version}.zip`;
  const source = `${href}/${zipFile}`;
  request
    .get(source)
    .on('error', function(error) {
      console.log(error);
    })
    .pipe(fs.createWriteStream(zipFile))
    .on('finish', function() {
      console.log('finished downloading');
      var zip = new admZip(zipFile);
      console.log('start unzip');
      var zipEntries = zip.getEntries(); // an array of ZipEntry records
      zipEntries.forEach(function (zipEntry) {
        if (zipEntry.entryName.endsWith("line.svg")) {
          zip.extractEntryTo(zipEntry.entryName, `./src/line`, true, true, false, zipEntry.entryName.split('/').slice(-1).pop().replace('-line.svg', '.svg'));
        }
        if (zipEntry.entryName.endsWith("fill.svg")) {
          zip.extractEntryTo(zipEntry.entryName, `./src/fill/`, false, true, false, zipEntry.entryName.split('/').slice(-1).pop().replace('-fill.svg', '.svg'));
        }
      });
      console.log('finished unzip');
    });
});

function onErr(err) {
  console.log(err);
  return 1;
}
