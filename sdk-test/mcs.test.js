const mocha = require('mocha')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const fs = require('fs').promises

const { mcsSDK } = require('../SDK/index')
require('dotenv').config()

describe('MCS SDK', function () {
  let mcs
  let sourceFileUploadId
  let size
  let ipfsUrl
  let fileName
  let numCollections
  it('Should not allow initialize SDK without API key', async () => {
    expect(
      mcsSDK.initialize({
        accessToken: process.env.ACCESS_TOKEN,
      }),
    ).to.eventually.be.throw()
  })

  it('Should not allow initialize SDK without Access Token', async () => {
    expect(
      mcsSDK.initialize({
        apiKey: process.env.API_KEY,
      }),
    ).to.eventually.be.throw()
  })

  it('Should not allow initialize SDK with empty parameters', async () => {
    expect(mcsSDK.initialize()).to.eventually.be.throw()
    expect(mcsSDK.initialize({})).to.eventually.be.throw()
  })

  it('Should initialize SDK', async () => {
    mcs = await mcsSDK.initialize({
      accessToken: process.env.CALI_ACCESS_TOKEN,
      apiKey: process.env.CALI_API_KEY,
      chainName: 'polygon.mumbai',
    })

    expect(mcs)
  })

  it('Should setup web3', async () => {
    expect(mcs.walletAddress).to.be.undefined
    await mcs.setupWeb3(process.env.PRIVATE_KEY, process.env.RPC_URL)
    expect(mcs.walletAddress)
  })

  describe('Onchain Storage functions', () => {
    it('Should upload a file', async () => {
      const uploadResponse = await mcs.upload('./mcs.test.js')
      sourceFileUploadId = uploadResponse.data.source_file_upload_id
      size = uploadResponse.data.file_size
      ipfsUrl = uploadResponse.data.ipfs_url

      expect(uploadResponse.status).to.equal('success')
    })

    it('Should pay for file', async () => {
      await mcs.makePayment(sourceFileUploadId, size)
    })

    it('Should get NFT collections', async () => {
      const collections = await mcs.getCollections()
      numCollections = collections.data.length
      expect(collections.status).to.equal('success')
    })

    it('Should create NFT collection', async () => {
      let metadata = {
        name: 'test collection' + numCollections,
        image: ipfsUrl,
      }

      const createResponse = await mcs.createCollection(metadata)

      const collections = await mcs.getCollections()
      expect(collections.data.length).to.equal(numCollections + 1)
    })

    it('Should mint NFT', async () => {
      let metadata = {
        name: 'test NFT',
        image: ipfsUrl,
      }

      const mintResponse = await mcs.mintAsset(sourceFileUploadId, metadata)
      expect(mintResponse.status).to.equal('success')
    })

    it('Should get uploads', async () => {
      const uploads = await mcs.getDealList()

      expect(uploads.data.source_file_upload[0].source_file_upload_id).to.equal(
        sourceFileUploadId,
      )
    })
  })

  describe('Bucket Storage functions', () => {
    let bucketName = 'test-bucket'
    describe('Buckets', () => {
      it('Should remove test-bucket', async () => {
        let buckets = await mcs.getBuckets()
        let testBucket = buckets.data.find((b) => b.bucket_name === bucketName)

        if (testBucket) {
          await mcs.deleteBucket(bucketName)
        }

        buckets = await mcs.getBuckets()
        testBucket = buckets.data.find((b) => b.bucket_name === 'test-bucket')

        expect(testBucket).to.be.undefined
      })
      it('Should create a new bucket', async () => {
        let bucket = await mcs.createBucket('test-bucket')

        expect(bucket.status).to.equal('success')
      })
      it('Should get all buckets', async () => {
        let buckets = await mcs.getBuckets()

        expect(buckets.data.length).to.be.greaterThan(0)
      })
    })

    let fileId
    describe('Files', () => {
      it('Should upload a file to bucket', async () => {
        fileName = `test-file-${Date.now()}`
        await fs.writeFile(`./${fileName}`, fileName)

        let upload = await mcs.uploadToBucket(
          bucketName,
          fileName,
          `./${fileName}`,
        )

        fileId = upload.data.file_id
        expect(upload.status).to.equal('success')
      })

      it('Should upload same file', async () => {
        let upload = await mcs.uploadToBucket(
          bucketName,
          fileName,
          `./${fileName}`,
        )

        expect(upload.status).to.equal('success')
        expect(upload.data.file_is_exist).to.equal(true)
      })

      it('Should download a file from bucket', async () => {
        let res = await mcs.downloadFile(bucketName, fileName, './download')
        const data = await fs.readFile(`./download/${fileName}`, 'utf8')
        expect(data).to.equal(fileName)
      })

      it('Should not allow download of non existing file', async () => {
        expect(
          mcs.downloadFile(bucketName, fileName + 'non-exisitng', './download'),
        ).to.eventually.be.throw('file not found')
      })

      it('Should delete the file', async () => {
        let res = await mcs.deleteFile(bucketName, fileName)
        expect(res.status).to.equal('success')

        expect(mcs.getFileInfo(bucketName, fileName)).to.eventually.be.throw()
      })

      it('Should throw error deleting file that does not exist', async () => {
        expect(mcs.deleteFile(bucketName, fileName)).to.eventually.be.throw()
      })
    })

    describe('Folders', () => {
      it('Should create a folder', async () => {
        let res = await mcs.createFolder(bucketName, 'test-folder')
        expect(res.status).to.equal('success')
      })

      it('Should not allow folder with same name', async () => {
        let res = await mcs.createFolder(bucketName, 'test-folder')
        expect(res.status).to.equal('error')
      })

      it('Upload inside folder', async () => {
        let upload = await mcs.uploadToBucket(
          bucketName,
          `test-folder/${fileName}`,
          `./${fileName}`,
        )

        expect(upload.status).to.equal('success')
      })

      it('Upload folder', async () => {
        let upload = await mcs.uploadToBucket(bucketName, 'test-folder', `./f1`)

        let bucketInfo = await mcs.getBucket(bucketName)
        expect(bucketInfo.file_number).to.equal(3)
      })

      it('Should delete the folder', async () => {
        let res = await mcs.deleteFile(bucketName, 'test-folder')
        let updatedList = await mcs.getFileList(bucketName)
        expect(res.status).to.equal('success')
        expect(updatedList.count).to.equal(0)
      })
    })
  })
})
