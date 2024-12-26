// ==UserScript==
// @name        基金投资
// @match       *://danjuanfunds.com/screw/valuation-table*
// @match       *://pa65zg4ajd.feishu.cn/wiki/S8SWwMhFiiLngokBdfMcpLqMnmd*
// @match       *://danjuanfunds.com/djapi/fund/nav/history/*
// @match       *://index.amcfortune.com/*
// @match       *://danjuanfunds.com/djmodule/value-center*
// @match       *://danjuanfunds.com/n/screw/valuation-table*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM.xmlHttpRequest
// @charset		UTF-8
// @license     GPL License
// @require     https://greasyfork.org/scripts/471561-sinhelper/code/SinHelper.js?version=1260860
// ==/UserScript==

(function () {
    'use strict';

    const sinHelper = window.sinHelper || {}

    /**
     * 蛋卷 - 螺丝钉估值表
     * https://danjuanfunds.com/screw/valuation-table?channel=1500012085
     */
    // if (location.href.includes('danjuanfunds.com/screw/valuation-table')) {
    //     sinHelper.Xhr.init()
    //     let _func = function (xhr) {
    //         let _this = this, _data = xhr.responseData.data, _url = sinHelper.Url.info(xhr.responseURL)
    //         try {
    //             window.parent.postMessage({
    //                 sinMsgName: 'lsd_valuation',
    //                 content: { data: { 'time': _data['time'], 'valuations': _data['valuations'] } }
    //             }, '*'); // https://pa65zg4ajd.feishu.cn
    //         } catch (e) {
    //             console.error("postMessage error :", e)
    //         }
    //     }
    //     // // 老接口，不可用
    //     // sinHelper.Xhr.registRules('/djapi/fundx/activity/user/vip_valuation/show/detail', (xhr) => {
    //     //     _func(xhr)
    //     // });
    //     // 新接口 https://danjuanfunds.com/djapi/fundx/base/vip/valuation/show/detail?source=lsd
    //     sinHelper.Xhr.registRules('/djapi/fundx/base/vip/valuation/show/detail', (xhr) => {
    //         _func(xhr)
    //     });
    // }
    /**
     * 蛋卷 - 基金历史净值API
     */
    // if (location.href.includes('danjuanfunds.com/djapi/fund/nav/history/')) {
    //     try {
    //         let _urlInfo = sinHelper.Url.info(location.href)
    //         window.parent.postMessage({
    //             sinMsgName: 'fund_history',
    //             content: { 'data': document.body.innerHTML, 'code': _urlInfo.pathname.replace('/djapi/fund/nav/history/', '') }
    //         }, '*');
    //     } catch (e) {
    //         console.error("postMessage error :", e)
    //     }
    // }

    window.addEventListener('message', async (e) => {
        if (!e.data.sinMsgName) return;

        let params = e.data.content || {};

        if (e.data.sinMsgName == 'lsd_valuation') {
            return requestLsd(params)
        }

        if (e.data.sinMsgName == 'danjuan_valuation') {
            return requestDanjuan(params)
        }

        if (e.data.sinMsgName == 'red_valuation') {
            return requestRed(params)
        }
    });

    const requestLsd = (params) => {
        let _url = `https://danjuanfunds.com/djapi/fundx/base/vip/valuation/show/detail?source=lsd&category_code=6`;
        GM.xmlHttpRequest({
            url: _url,
            onload: (res) => {
                let _text = res.responseText;
                try {
                    window.parent.postMessage({
                        sinMsgName: 'lsd_valuation',
                        content: { data: _text, url: _url, params: params }
                    }, '*');
                } catch (e) {
                    console.error("postMessage error :", e)
                }
            }
        });
    }
    const requestDanjuan = (params) => {
        let _url = `https://danjuanfunds.com/djapi/index_eva/dj`;
        GM.xmlHttpRequest({
            url: _url,
            onload: (res) => {
                let _text = res.responseText;
                try {
                    window.parent.postMessage({
                        sinMsgName: 'danjuan_valuation',
                        content: { data: _text, url: _url, params: params }
                    }, '*');
                } catch (e) {
                    console.error("postMessage error :", e)
                }
            }
        });
    }

    /* 红色火箭 历史估值 */
    const requestRed = (params) => {
        // since_inception, last_10_years
        let _url = `https://index.amcfortune.com/fundex-quote/index/valuation?securityCode=${params['code']}&valuationType=${params['type']}&timeInterval=last_10_years&ts=` + new Date().getTime()
        console.log('模拟请求：', params['code'], params['type'])
        GM.xmlHttpRequest({
            url: _url,
            onload: (res) => {
                let _text = res.responseText;
                try {
                    window.parent.postMessage({
                        sinMsgName: 'red_valuation',
                        content: { data: _text, url: _url, params: params }
                    }, '*');
                } catch (e) {
                    console.error("postMessage error :", e)
                }
            }
        });
    }

    /**
     * 蛋卷 - 指数估值
     * https://danjuanfunds.com/djapi/index_eva/dj
     */
    if (location.href.includes('danjuanfunds.com/djapi/index_eva/dj')) {
        parseApiPage('danjuan_valuation');
    }
    /**
     * 红色火箭 - 历史估值
     * https://index.amcfortune.com/fundex-quote/index/valuation?securityCode=000300.SH&valuationType=PE&timeInterval=last_10_years&ts=1733827945000
     */
    if (location.href.includes('index.amcfortune.com/fundex-quote/index/valuation')) {
        parseApiPage('red_valuation');
    }
    const parseApiPage = (sinMsgName) => {
        let _text = null;
        if (document.querySelector('body > pre')) {
            _text = document.querySelector('body > pre').innerText;
        } else {
            if (document.querySelector('body > div[hidden="true"]')) {
                _text = document.querySelector('body > div[hidden="true"]').innerText;
            }
        }
        try {
            window.parent.postMessage({
                sinMsgName: sinMsgName,
                content: { data: _text, url: location.href }
            }, '*');
        } catch (e) {
            console.error("postMessage error :", e)
        }
    }

    // window.bitableStore.base.tableMap.get('tblq8ArLaAsi45Bx')
    // bitableStore.getCellValue('tblq8ArLaAsi45Bx', 'reclmNqzWE', 'fldkvESdxt')

    // if (location.href.includes('feishu')) {
    //     window.addEventListener('message', e => {
    //         if (e.data.magic === true) {
    //             GM_setValue('lsd_valuation', JSON.stringify(e.data.data))
    //             sessionStorage.setItem('lsd_valuation', JSON.stringify(e.data.data))
    //         }
    //     });
    // }
})();