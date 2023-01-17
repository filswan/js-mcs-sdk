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
  })

  describe('Bucket Storage functions', () => {
    let bucketUid
    describe('Buckets', () => {
      it('Should remove test-bucket', async () => {
        let buckets = await mcs.getBuckets()
        let testBucket = buckets.data.find(
          (b) => b.bucket_name === 'test-bucket',
        )

        if (testBucket) {
          await mcs.deleteBucket(testBucket.bucket_uid)
        }

        buckets = await mcs.getBuckets()
        testBucket = buckets.data.find((b) => b.bucket_name === 'test-bucket')

        expect(testBucket).to.be.undefined
      })
      it('Should create a new bucket', async () => {
        let bucket = await mcs.createBucket('test-bucket')
        bucketUid = bucket.data

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

        let upload = await mcs.uploadToBucket(`./${fileName}`, bucketUid, '')

        fileId = upload.data.file_id
        expect(upload.status).to.equal('success')
      })

      it('Should upload same file', async () => {
        let upload = await mcs.uploadToBucket(`./${fileName}`, bucketUid, '')

        expect(upload.status).to.equal('success')
        expect(upload.data.file_is_exist).to.equal(true)
      })

      it('Should download a file from bucket', async () => {
        let res = await mcs.downloadFile(fileId, './download')
        const data = await fs.readFile(`./download/${fileName}`, 'utf8')
        expect(data).to.equal(fileName)
      })

      it('Should not allow download of non existing file', async () => {
        expect(mcs.downloadFile(-1, './download')).to.eventually.be.throw(
          'file not found',
        )
      })

      it('Should delete the file', async () => {
        let res = await mcs.deleteFile(fileId)
        expect(res.status).to.equal('success')

        expect(mcs.getFileInfo(fileId)).to.eventually.be.throw()
      })

      it('Should throw error deleting file that does not exist', async () => {
        let res = await mcs.deleteFile(fileId)
        expect(res.status).to.equal('error')
      })
    })

    describe('Folders', () => {
      it('Should create a folder', async () => {
        let res = await mcs.createFolder(bucketUid, 'test-folder', '')
        expect(res.status).to.equal('success')
      })

      it('Should not allow folder with same name', async () => {
        let res = await mcs.createFolder(bucketUid, 'test-folder', '')
        expect(res.status).to.equal('error')
      })

      it('Upload inside folder', async () => {
        let upload = await mcs.uploadToBucket(
          `./${fileName}`,
          bucketUid,
          'test-folder',
        )

        expect(upload.status).to.equal('success')
      })

      it('Upload folder', async () => {
        let upload = await mcs.uploadToBucket(`./f1`, bucketUid, 'test-folder')

        let bucketInfo = (await mcs.getBuckets()).data.find(
          (buckets) => buckets.bucket_uid === bucketUid,
        )
        expect(bucketInfo.file_number).to.equal(3)
      })

      it('Should delete the folder', async () => {
        let folder = (await mcs.getFileList(bucketUid)).file_list.find(
          (file) => file.name === 'test-folder',
        )
        let res = await mcs.deleteFile(folder.id)
        let updatedList = await mcs.getFileList(bucketUid)
        expect(res.status).to.equal('success')
        expect(updatedList.count).to.equal(0)
      })
    })
  })
})
