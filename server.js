const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");
// const { readFile, writeFile, createReadStream } = require("fs").promises;
const fs = require("fs");
require("dotenv").config();
const replace = require("replace-in-file");

const bodyParser = require("body-parser");
let region = "";
let stackName;
let file = "";
let fileStream = "";
let vpcName = "";
let vpcCidr = "";
let publicSubnet1Cidr;
let publicSubnet2Cidr = "";
let privateSubnet1Cidr = "";
let privateSubnet2Cidr = "";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/create-demo", (req, res) => {
  region = req.body.region;
  stackName = req.body.stackName;
  servicesUsed = req.body.servicesUsed;
  // vpcName = req.body.vpcName;
  // vpcCidr = req.body.vpcCidr;
  // publicSubnet1Cidr = req.body.publicSubnet1Cidr;
  // publicSubnet2Cidr = req.body.publicSubnet2Cidr;
  // privateSubnet1Cidr = req.body.privateSubnet1Cidr;
  // privateSubnet2Cidr = req.body.privateSubnet2Cidr;
  // const template = req.body.template;

  console.log(region);
  console.log(stackName);
  console.log(servicesUsed);
  // console.log(vpcName);
  // console.log(vpcCidr);
  // console.log(publicSubnet1Cidr);
  // console.log(publicSubnet2Cidr);
  // console.log(privateSubnet1Cidr);
  // console.log(privateSubnet2Cidr);
  // console.log(template);

  writeToFile();
});

const getText = async (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const writeToFile = async () => {
  const fileStream = await getText("./Template-Snippets/vpc.yaml");
  fs.writeFile(
    `./New-Templates/${stackName}.yaml`,
    fileStream,
    { flag: "a" },
    (err, data) => {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log(data);
      }
    }
  );
  file = `${stackName}.yaml`;

  uploadFileToS3(file, fileStream);
};
writeToFile();

const S3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});

async function uploadFileToS3(file, fileStream) {
  const params = {
    Bucket: "capstone-cfn-user-uploaded-templates",
    Key: file,
    Body: fileStream,
  };

  S3.upload(params, (err, data) => {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
}

app.listen(port, () => console.log(`Server is listening on port ${port}`));
