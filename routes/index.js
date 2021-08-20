var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const fs = require('fs')


/**
 *  1. page.goto (https://weixin.sogou.com/weixin?query=GL8&type=2&page=2&ie=utf8)
 *  2. tenResult = selector.('txt-box')
 *  3. tenResult for i   item..children('s2').text() .include('小时前') || include('天前'）
 *  4. if true,  item..children('s2').text(), item.children('h3').children('a').href();. push to array
 *  5. array . fori  {page.goto(array.item.url) , page.title ,  page.url}
 *  6. save to md5.json
 */


function Person(urls, md5) {
    this.urls = urls;
    this.md5 = md5;
    this.run = async function () {
        let that = this
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                console.log('run', that.urls)
                console.log('run', that.md5)
                debugger
                resolve(that.md5)
            }, 10000);
        })
    }
}

Person.prototype = {
    constructor: Person
}



router.post('/', async function (req, res, next) {
    process.setMaxListeners(0)
    let urls = JSON.parse(req.body.urls);
    console.log(urls)
    const md5 = crypto.createHash('md5');
    let dataMD5 = md5.update(req.body.urls).digest('hex');
    let requestData = {
        id: dataMD5,
        completed: 0,
        length: urls.length,
    }

    try {

        if (!fs.existsSync('./wei_xin_md5.json')) {
            fs.writeFileSync('./wei_xin_md5.json', JSON.stringify(requestData))
            new Person(urls, dataMD5).run().then((result) => {
                console.log('result1', result)
            })

            res.json({msg: '开始抓取...', code: 200, success: true, id: dataMD5})
        } else {
            const data = JSON.parse('[' + fs.readFileSync('./wei_xin_md5.json', 'utf8') + ']')

            let alreadyInSpam = data.some((item) => {
                return item.id === dataMD5
            })
            if (alreadyInSpam) {
                res.json({msg: '相同数据正在在抓取中', code: 200, success: false, id: dataMD5})
            } else {
                fs.appendFileSync('./wei_xin_md5.json', ',' + JSON.stringify(requestData))
                new Person(urls, dataMD5).run().then((result) => {
                    console.log('result', result)
                })
                res.json({msg: '开始抓取...', code: 200, success: true, id: dataMD5})
            }
        }
    } catch (err) {
        console.error(err)
    }
});

module.exports = router;
