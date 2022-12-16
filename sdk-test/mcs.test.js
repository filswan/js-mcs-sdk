// Importing mocha and chai
const mocha = require('mocha')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const fs = require('fs').promises

// Importing fareutils.js where our code is written
const { mcsSDK } = require('../SDK/index')
require('dotenv').config()

// Group of tests using describe
describe('MCS SDK', function () {
  let mcs
  let sourceFileUploadId
  let size
  let ipfsUrl
  let fileName
  // We will describe each single test using it
  it('Should initialize SDK', async () => {
    mcs = await mcsSDK.initialize({
      privateKey: process.env.PRIVATE_KEY,
      rpcUrl: 'https://polygon-rpc.com/',
    })

    expect(mcs)
  })

  describe('MCS functions', () => {
    it('Should upload a file', async () => {
      const testFile = JSON.stringify({ address: mcs.walletAddress })
      const fileArray = [
        { fileName: `${mcs.walletAddress}.txt`, file: testFile },
      ]

      const uploadResponse = await mcs.upload(fileArray)
      sourceFileUploadId = uploadResponse[0].data.source_file_upload_id
      size = uploadResponse[0].data.file_size
      ipfsUrl = uploadResponse[0].data.ipfs_url

      expect(uploadResponse[0].status).to.equal('success')
    })

    it('Should pay for file', async () => {
      await mcs.makePayment(sourceFileUploadId, '', size)
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

    it('Should get storage status', async () => {
      const status = await mcs.getFileStatus(2065)

      expect(status.data.offline_deal_log.length).to.be.greaterThan(0)
    })

    // can only view details of files uploaded by the user
    // it('Should get deal details', async () => {
    //   const details = await mcs.getFileDetails('150903', 7496)

    //   expect(details.status).to.equal('success')
    // })
  })

  describe('Buckets functions', () => {
    let bucketId
    describe('Buckets', () => {
      it('Should remove any bucket', async () => {
        let buckets = await mcs.getBuckets()
        let id = buckets.data.objects[0]?.id

        if (id) await mcs.deleteBucket(id)
      })
      it('Should create a new bucket', async () => {
        let bucket = await mcs.createBucket('test-bucket')

        expect(bucket.status).to.equal('success')
      })
      it('Should get all buckets', async () => {
        let buckets = await mcs.getBuckets()

        expect(buckets.data.objects.length).to.be.greaterThan(0)
      })

      it('Should get the new bucket', async () => {
        let bucket = await mcs.getBucket('test-bucket')
        bucketId = bucket.data.parent

        expect(bucketId).to.equal(await mcs.getBucketId('test-bucket'))
        expect(bucket.status).to.equal('success')
      })

      it('Should delete the new bucket', async () => {
        let res = await mcs.deleteBucket(bucketId)
        expect(res.status).to.equal('success')

        let bucket = await mcs.getBuckets()
        expect(bucket.data.objects.length).to.equal(0)
      })
    })

    describe('Files', () => {
      it('Should upload a file to bucket', async () => {
        await mcs.createBucket('test-bucket')

        fileName = `test-file-${Date.now()}`

        let upload = await mcs.uploadToBucket(
          'test-bucket',
          fileName,
          './file1.txt',
        )
        expect(upload.status).to.equal('success')
      })

      it('Should download a file from bucket', async () => {
        await mcs.downloadFile('test-bucket', fileName, './download')

        try {
          const data = await fs.readFile(`./download/${fileName}`, 'utf8')
          expect(data).to.equal('Hello, World!')
        } catch (err) {
          console.error(err)
        }
      })

      it('Should not allow download of non existing file', async () => {
        expect(
          mcs.downloadFile('test-bucket', 'nonexisting_file', './download'),
        ).to.eventually.be.throw('file not found')

        // try {
        //   const data = await fs.readFile(`./download/${fileName}`, 'utf8')
        //   expect(data).to.equal('Hello, World!')
        // } catch (err) {
        //   console.error(err)
        // }
      })

      it('Should delete the file', async () => {
        let bucket = await mcs.getBucket('test-bucket')
        let file = bucket.data.objects.find((file) => file.name === fileName)

        expect(file.id).to.equal(await mcs.getFileId('test-bucket', fileName))

        let res = await mcs.deleteFileFromBucket(file.id)
        expect(res.status).to.equal('success')

        bucket = await mcs.getBucket('test-bucket')
        expect(bucket.data.objects.length).to.equal(0)
      })
    })
  })
})