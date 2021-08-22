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

function sleeep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getData(page, keyword, md5, i) {
    let thatPage = page;
    let thatKeywords = keyword;
    let thatMd5 = md5;
    let thatI = i;
    return new Promise(async (resolve, reject) => {

        // let title = await page.title();
        // console.log('title', title)
        await page.evaluateOnNewDocument(() => {
            const newProto = navigator.__proto__;
            delete newProto.webdriver;
            navigator.__proto__ = newProto;
            window.chrome = {};
            window.chrome.app = {
                "InstallState": "hehe",
                "RunningState": "haha",
                "getDetails": "xixi",
                "getIsInstalled": "ohno"
            };
            window.chrome.csi = function () {
            };
            window.chrome.loadTimes = function () {
            };
            window.chrome.runtime = function () {
            };
            Object.defineProperty(navigator, 'userAgent', {  //userAgent在无头模式下有headless字样，所以需覆写
                get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
            });
            Object.defineProperty(navigator, 'plugins', {  //伪装真实的插件信息
                get: () => [{
                    "description": "Portable Document Format",
                    "filename": "internal-pdf-viewer",
                    "length": 1,
                    "name": "Chrome PDF Plugin"
                }]
            });
            Object.defineProperty(navigator, 'languages', { //添加语言
                get: () => ["zh-CN", "zh", "en"],
            });
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({state: Notification.permission}) :
                    originalQuery(parameters)
            );
        })
        let currentKeywordData = []
        for (let j = 0; j < 10; j++) {
            await page.goto('https://weixin.sogou.com/weixin?query=' + thatKeywords + '&type=2&page=' + (j + 1) + '&ie=utf8', {
                waitUntil: 'load',
                timeout: 5 * 1000
            }).catch(() => {
                console.log('打开网站时发生错误')
            })
            await page.addScriptTag({path: './jquery.js'})
            await page.waitFor(3000)
            let result = await page.evaluate(() => {
                let miaoQuery = jQuery.noConflict();
                let news = miaoQuery(".news-list").children('li').filter(function () {
                    let time = miaoQuery(this).find(".s2").text()
                    console.log('time:', time)
                    return (time.indexOf('小时前') > -1) || (time.indexOf('天前') > -1)
                    // return (time.indexOf('2020-') > -1)  || (time.indexOf('2021-') > -1)
                })
                let data = news.map(function () {
                    // let title = miaoQuery(this).children('div').eq(1).children('h3').eq(0).children('a').eq(0).text()
                    let title = miaoQuery(this).children('.txt-box').eq(0).children('h3').eq(0).children('a').eq(0).text()
                    console.log('title:', title)
                    let url = 'https://weixin.sogou.com' + miaoQuery(this).children('.txt-box').eq(0).children('h3').eq(0).children('a').eq(0).attr('href')
                    console.log('url:', url)
                    let date = miaoQuery(this).find(".s2").text()
                    let summary = miaoQuery(this).children('.txt-box').eq(0).children('.txt-info').eq(0).text()
                    return {title, url, date, summary}
                }).get();
                return data;
            })
            console.log(thatKeywords,result)
            //转换url
            for (let k = 0; k < result.length; k++) {
                console.log(thatKeywords + ' index '+ k + ": ", result[k])
                await page.goto(result[k].url, {
                    waitUntil: 'load',
                    timeout: 5 * 1000
                })
                await page.waitFor(2000)
                result[k].url = page.url()
                // console.log("result[i]",result[i])
            }
            //一页的数据
            currentKeywordData.push(...result)
            console.log('result', result)
        }
        thatPage.close()
        //TODO 写入文件
        resolve(currentKeywordData)
    })
}

function Person(keywords, md5) {
    this.keywords = keywords;
    this.md5 = md5;
    this.run = async function () {
        let that = this
        return new Promise(async (resolve, reject) => {
            const browser = await puppeteer.launch({
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                },
                ignoreDefaultArgs: ["--enable-automation"],
                headless: false
            });

            let arr = []
            for (let i = 0; i < that.keywords.length; i++) {
                const page = await browser.newPage();
                arr.push(getData(page, that.keywords[i], that.md5, i))
                await sleeep(5000)
            }
            Promise.all(arr).then((values) => {
                console.log('all complete', values)
                browser.close()
                // fs.writeFile('./data/'+ md5 + '_data.json', JSON.stringify(values), function () {
                //     console.log('保存成功')
                // })
            })

        })
    }
}

Person.prototype = {
    constructor: Person
}


router.post('/', function (req, res, next) {
    process.setMaxListeners(0)
    let keywords = JSON.parse(req.body.keywords);
    console.log(keywords)
    const md5 = crypto.createHash('md5');
    let dataMD5 = md5.update(req.body.keywords).digest('hex');
    let requestData = {
        id: dataMD5,
        completed: 0,
        length: keywords.length,
    }

    try {

        if (!fs.existsSync('./wei_xin_md5.json')) {
            fs.writeFileSync('./wei_xin_md5.json', JSON.stringify(requestData))
            new Person(keywords, dataMD5).run().then((result) => {
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
                new Person(keywords, dataMD5).run().then((result) => {
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
