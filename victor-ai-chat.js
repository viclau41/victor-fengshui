// Victor AI 聊天助手 - 嵌入式版本 v2.9 (時柱修正 + 玄空飛星完整版)
// 使用方法：在 </body> 前加入 <script src="victor-ai-chat.js"></script>
// 同時需要將 lunar.min.js 放在同一目錄

(function() {
    'use strict';

    // ========== 版本資訊 ==========
    var VICTOR_AI_VERSION = '2.9';
    console.log('[Victor AI] 版本 ' + VICTOR_AI_VERSION + ' 開始載入...');

    // ========== 【新增】自動計算本年九宮飛星分佈 ==========
    function getYearFlyingStars() {
        var year = new Date().getFullYear();
        var centerNum = (11 - (year % 9)) % 9;
        centerNum = centerNum === 0 ? 9 : centerNum;

        var starNames = ["", "一白貪狼水星", "二黑巨門土星", "三碧祿存木星", "四綠文曲木星", "五黃廉貞土星", "六白武曲金星", "七赤破軍金星", "八白左輔土星", "九紫右弼火星"];
        var starShort = ["", "一白", "二黑", "三碧", "四綠", "五黃", "六白", "七赤", "八白", "九紫"];
        var starNature = ["", "吉（財運、桃花、人緣）", "凶（病符、疾病）", "凶（是非、口舌、官非）", "吉（文昌、學業、考試）", "大凶（災煞、意外、破財）", "吉（權貴、武曲、事業）", "凶（破財、盜賊、口舌）", "大吉（當運財星、置業）", "吉（喜慶、姻緣、升遷）"];
        var starRemedy = ["",
            "催旺：放水種植物或魚缸",
            "化解：放銅器、銅錢或金色重物，忌動土",
            "化解：放紅色物品洩木氣，忌放水種植物",
            "催旺：放文昌塔、毛筆、水種富貴竹四枝",
            "化解：放銅風鈴、六帝古錢、金屬物，忌動土忌紅色",
            "催旺：放金屬鐘或銅器",
            "化解：放藍色物品或清水一杯",
            "催旺：放紅色物品或長明燈",
            "催旺：放紅色地毯或紫色物品"
        ];

        // 飛星順飛順序：中宮→西北→西→東北→南→北→西南→東→東南
        var directions = ['中宮', '西北', '正西', '東北', '正南', '正北', '西南', '正東', '東南'];

        var stars = [];
        for (var i = 0; i < 9; i++) {
            var sn = ((centerNum - 1 + i) % 9) + 1;
            stars.push({
                direction: directions[i],
                starNum: sn,
                name: starNames[sn],
                short: starShort[sn],
                nature: starNature[sn],
                remedy: starRemedy[sn]
            });
        }

        // 整理成九宮格文字
        var gridText = year + '年流年飛星九宮圖（' + starShort[centerNum] + '入中宮）：\n';
        var dirMap = {};
        for (var j = 0; j < stars.length; j++) {
            dirMap[stars[j].direction] = stars[j];
        }
        gridText += '┌─────────┬─────────┬─────────┐\n';
        gridText += '│ 東南 ' + dirMap['東南'].short + ' │ 正南 ' + dirMap['正南'].short + ' │ 西南 ' + dirMap['西南'].short + ' │\n';
        gridText += '├─────────┼─────────┼─────────┤\n';
        gridText += '│ 正東 ' + dirMap['正東'].short + ' │ 中宮 ' + dirMap['中宮'].short + ' │ 正西 ' + dirMap['正西'].short + ' │\n';
        gridText += '├─────────┼─────────┼─────────┤\n';
        gridText += '│ 東北 ' + dirMap['東北'].short + ' │ 正北 ' + dirMap['正北'].short + ' │ 西北 ' + dirMap['西北'].short + ' │\n';
        gridText += '└─────────┴─────────┴─────────┘\n\n';

        gridText += '各方位詳解：\n';
        for (var k = 0; k < stars.length; k++) {
            gridText += '• ' + stars[k].direction + '：' + stars[k].name + ' — ' + stars[k].nature + '\n';
            gridText += '  ' + stars[k].remedy + '\n';
        }

        return { year: year, centerStar: centerNum, centerName: starNames[centerNum], stars: stars, gridText: gridText };
    }

    // ========== 載入農曆庫 ==========
    var lunarLoaded = false;
    var lunarLoadAttempted = false;

    function loadLunarLibrary() {
        if (lunarLoadAttempted) return;
        lunarLoadAttempted = true;

        var lunarScript = document.createElement('script');
        var currentScript = document.currentScript || document.querySelector('script[src*="victor-ai-chat"]');
        var scriptBase = currentScript ? currentScript.src.substring(0, currentScript.src.lastIndexOf('/') + 1) : '';
        var localUrl = scriptBase + 'lunar.min.js';

        console.log('[Victor AI] 嘗試從同服務器載入農曆庫:', localUrl);
        lunarScript.src = localUrl;

        lunarScript.onload = function() {
            if (typeof Lunar !== 'undefined') {
                lunarLoaded = true;
                console.log('[Victor AI] ✅ 農曆庫從同服務器載入成功！');
                testLunarLibrary();
            } else {
                console.warn('[Victor AI] ⚠️ 農曆庫載入但 Lunar 對象不存在，嘗試 CDN...');
                loadLunarFromCDN();
            }
        };

        lunarScript.onerror = function() {
            console.warn('[Victor AI] ⚠️ 同服務器載入農曆庫失敗，嘗試 CDN...');
            loadLunarFromCDN();
        };

        document.head.appendChild(lunarScript);
    }

    function loadLunarFromCDN() {
        var cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript@1.6.8/lunar.min.js';

        cdnScript.onload = function() {
            if (typeof Lunar !== 'undefined') {
                lunarLoaded = true;
                console.log('[Victor AI] ✅ 農曆庫從 CDN 載入成功！');
                testLunarLibrary();
            } else {
                console.error('[Victor AI] ❌ CDN 載入完成但 Lunar 對象不存在');
            }
        };

        cdnScript.onerror = function() {
            console.error('[Victor AI] ❌ CDN 載入農曆庫也失敗了！農曆和八字功能將不可用。');
        };

        document.head.appendChild(cdnScript);
    }

    function testLunarLibrary() {
        try {
            var now = new Date();
            var lunar = Lunar.fromDate(now);
            console.log('[Victor AI] 農曆測試 - 今天:', lunar.getYearInGanZhi() + '年 ' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese());
            console.log('[Victor AI] 農曆測試 - 日干支:', lunar.getDayInGanZhi(), '時干支:', lunar.getTimeInGanZhi());

            var testDate = new Date(1985, 11, 27, 22, 30, 0);
            testDate.setFullYear(1985);
            var testLunar = Lunar.fromDate(testDate);
            console.log('[Victor AI] 驗證測試 - 1985-12-27 22:30 時柱:', testLunar.getTimeInGanZhi(), '(應為丁亥)');
        } catch (e) {
            console.error('[Victor AI] 農曆測試失敗:', e);
        }
    }

    loadLunarLibrary();

    // ========== 本地時間函數 ==========
    function getLocalTime() {
        var now = new Date();
        var y = now.getFullYear();
        var m = String(now.getMonth() + 1).padStart(2, '0');
        var d = String(now.getDate()).padStart(2, '0');
        var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        var w = weekdays[now.getDay()];
        var h = String(now.getHours()).padStart(2, '0');
        var min = String(now.getMinutes()).padStart(2, '0');
        var base = y + '年' + m + '月' + d + '日（星期' + w + '）' + h + ':' + min;

        try {
            if (typeof Lunar !== 'undefined') {
                var lunar = Lunar.fromDate(now);
                var solar = Solar.fromDate(now);

                var lunarDate = '農曆' + lunar.getYearInGanZhi() + '年（' + lunar.getYearShengXiao() + '年）' +
                    lunar.getMonthInChinese() + '月' + lunar.getDayInChinese();
                var ganZhi = '日干支：' + lunar.getDayInGanZhi() + '　時干支：' + lunar.getTimeInGanZhi();

                var jieQi = lunar.getJieQi();
                var jieQiStr = jieQi ? '\n節氣：' + jieQi : '';

                var festivals = [];
                try {
                    var lunarFests = lunar.getFestivals();
                    if (lunarFests && lunarFests.length > 0) festivals = festivals.concat(lunarFests);
                    var solarFests = solar.getFestivals();
                    if (solarFests && solarFests.length > 0) festivals = festivals.concat(solarFests);
                    var otherFests = lunar.getOtherFestivals();
                    if (otherFests && otherFests.length > 0) festivals = festivals.concat(otherFests);
                } catch (e) {}
                var festivalStr = festivals.length > 0 ? '\n節日：' + festivals.join('、') : '';

                var yiStr = '', jiStr = '';
                try {
                    var yi = lunar.getDayYi();
                    var ji = lunar.getDayJi();
                    if (yi && yi.length > 0) yiStr = '\n今日宜：' + yi.join('、');
                    if (ji && ji.length > 0) jiStr = '\n今日忌：' + ji.join('、');
                } catch (e) {}

                var chongSha = '';
                try {
                    chongSha = '\n沖煞：沖' + lunar.getDayChongDesc() + '　煞' + lunar.getDaySha();
                } catch (e) {}

                var positions = '';
                try {
                    positions = '\n財神方位：' + lunar.getDayPositionCaiDesc() +
                        '　喜神方位：' + lunar.getDayPositionXiDesc() +
                        '　福神方位：' + lunar.getDayPositionFuDesc();
                } catch (e) {}

                var pengZu = '';
                try {
                    pengZu = '\n彭祖百忌：' + lunar.getPengZuGan() + '　' + lunar.getPengZuZhi();
                } catch (e) {}

                var naYin = '';
                try {
                    var eightChar = lunar.getEightChar();
                    naYin = '\n日納音：' + eightChar.getDayNaYin() + '　年納音：' + eightChar.getYearNaYin();
                } catch (e) {}

                var xiu = '';
                try {
                    xiu = '\n值日星宿：' + lunar.getXiu() + '（' + lunar.getAnimal() + '）' + lunar.getGong() + '宮';
                } catch (e) {}

                return base + '\n' + lunarDate + '\n' + ganZhi +
                    jieQiStr + festivalStr + naYin + positions + chongSha +
                    yiStr + jiStr + pengZu + xiu;
            }
        } catch (e) {
            console.error('[Victor AI] getLocalTime 農曆部分出錯:', e);
        }
        return base;
    }

    // ========== 時間解析獨立函數 ==========
    function parseTimeFromMessage(userMessage) {
        var timePatterns = [
            /(上午|下午|早上|晚上|凌晨|半夜|深夜|夜晚|傍晚|中午|正午|午後|pm|am)\s*(\d{1,2})\s*[時點:：]\s*(\d{0,2})/i,
            /(\d{1,2})\s*[時點:：]\s*(\d{0,2})/
        ];
        var zhiPattern = /[甲乙丙丁戊己庚辛壬癸]?([子丑寅卯辰巳午未申酉戌亥])時/;
        var zhiHourMap = { '子': 0, '丑': 2, '寅': 4, '卯': 6, '辰': 8, '巳': 10, '午': 12, '未': 14, '申': 16, '酉': 18, '戌': 20, '亥': 22 };

        var hour = -1;
        var min = 0;
        var ampm = '';
        var hourMatch = null;

        var match1 = userMessage.match(timePatterns[0]);
        if (match1) {
            ampm = match1[1] || '';
            hour = parseInt(match1[2], 10);
            if (match1[3] && match1[3] !== '') {
                min = parseInt(match1[3], 10);
            }
            hourMatch = match1;
            console.log('[Victor AI] 時間匹配（格式1帶時段）: ampm=' + ampm + ', hour=' + hour + ', min=' + min);
        } else {
            // 容許年月日間有空格
            var cleanedMsg = userMessage.replace(/\d{4}\s*[年\-\/.]\s*\d{1,2}\s*[月\-\/.]\s*\d{1,2}\s*[日號]?/, '___DATE___');
            var match2 = cleanedMsg.match(timePatterns[1]);
            if (match2) {
                hour = parseInt(match2[1], 10);
                if (match2[2] && match2[2] !== '') {
                    min = parseInt(match2[2], 10);
                }
                hourMatch = match2;
                console.log('[Victor AI] 時間匹配（格式2無時段）: hour=' + hour + ', min=' + min);
            }
        }

        if (hourMatch && userMessage.match(/\d{1,2}\s*[時點:：]\s*半/)) {
            min = 30;
        }

        if (hour !== -1 && ampm) {
            if (/(下午|晚上|夜晚|傍晚|午後|pm)/i.test(ampm)) {
                if (hour < 12) hour += 12;
            } else if (/(上午|早上|凌晨|am)/i.test(ampm)) {
                if (hour === 12) hour = 0;
            } else if (/(半夜|深夜)/i.test(ampm)) {
                if (hour === 12) hour = 0;
                else if (hour > 6 && hour < 12) hour += 12;
            } else if (/(中午|正午)/i.test(ampm)) {
                if (hour < 4 && hour !== 12) hour += 12;
            }
        }

        var zhiMatch = userMessage.match(zhiPattern);
        if (hour === -1 && zhiMatch && zhiHourMap[zhiMatch[1]] !== undefined) {
            hour = zhiHourMap[zhiMatch[1]];
            min = 30;
            console.log('[Victor AI] 使用地支時辰: ' + zhiMatch[1] + ' → hour=' + hour);
        }

        if (isNaN(hour) || hour < 0 || hour > 23) hour = -1;
        if (isNaN(min) || min < 0 || min > 59) min = 0;

        return { hour: hour, min: min };
    }

    // ========== 西曆轉八字函數（終極防呆版）==========
    function getBaziFromDate(dateStr, timeHour, timeMin) {
        try {
            if (typeof Lunar === 'undefined' || typeof Solar === 'undefined') {
                console.warn('[Victor AI] Lunar 庫未載入');
                return null;
            }
            var parts = dateStr.split('-');
            var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
            var min = (typeof timeMin === 'number' && timeMin >= 0) ? timeMin : 0;
            var solar;
            
            // 判定是否有輸入有效的小時
            var hasTime = (typeof timeHour === 'number' && timeHour >= 0);
            
            if (hasTime) {
                var dateObj = new Date(y, m - 1, d, timeHour, min, 0);
                solar = Solar.fromDate(dateObj);
            } else {
                solar = Solar.fromYmd(y, m, d);
            }
            
            var lunar = solar.getLunar();
            var eightChar = lunar.getEightChar();
            
            try {
                if (typeof eightChar.setSect === 'function') {
                    eightChar.setSect(2); // 確保晚子時日柱算當天
                }
            } catch(e){}

            var yearPillar = eightChar.getYear();
            var monthPillar = eightChar.getMonth();
            var dayPillar = eightChar.getDay();
            
            var timePillar = "";
            if (hasTime) {
                var dayGan = dayPillar.charAt(0);
                var ganArray = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
                var zhiArray = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
                
                var zhiIndex = Math.floor((timeHour + 1) % 24 / 2);
                var timeZhi = zhiArray[zhiIndex];
                
                var dayGanIndex = ganArray.indexOf(dayGan);
                var actualDayGanIndex = dayGanIndex;
                if (timeHour === 23) {
                    actualDayGanIndex = (dayGanIndex + 1) % 10;
                }
                
                var startGanIndex = ((actualDayGanIndex % 5) * 2) % 10;
                var timeGanIndex = (startGanIndex + zhiIndex) % 10;
                var timeGan = ganArray[timeGanIndex];
                
                timePillar = timeGan + timeZhi;
            } else {
                timePillar = ""; 
            }

            var result = '四柱八字：' + yearPillar + '年　' + monthPillar + '月　' + dayPillar + '日';
            if (hasTime) {
                result += '　' + timePillar + '時'; 
            }

            try {
                result += '\n納音：' + eightChar.getYearNaYin() + '（年）　' + eightChar.getMonthNaYin() + '（月）　' + eightChar.getDayNaYin() + '（日）';
                if (hasTime) {
                    var tNaYin = "";
                    try { tNaYin = eightChar.getTimeNaYin(); } catch(e){}
                    if (tNaYin) {
                        result += '　' + tNaYin + '（時）';
                    }
                }
            } catch (e) { /* ignore */ }

            try {
                result += '\n農曆：' + lunar.getYearInGanZhi() + '年（' + lunar.getYearShengXiao() + '年）' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese();
            } catch (e) { /* ignore */ }

            try {
                var yi = lunar.getDayYi();
                var ji = lunar.getDayJi();
                if (yi && yi.length > 0) result += '\n該日宜：' + yi.join('、');
                if (ji && ji.length > 0) result += '\n該日忌：' + ji.join('、');
            } catch (e) { /* ignore */ }

            try {
                result += '\n沖煞：沖' + lunar.getDayChongDesc() + '　煞' + lunar.getDaySha();
            } catch (e) { /* ignore */ }

            try {
                result += '\n財神：' + lunar.getDayPositionCaiDesc() +
                    '　喜神：' + lunar.getDayPositionXiDesc() +
                    '　福神：' + lunar.getDayPositionFuDesc();
            } catch (e) { /* ignore */ }

            return result;
        } catch (e) {
            console.error('[Victor AI] getBaziFromDate 致命錯誤:', e);
            return null;
        }
    }

    // ========== Language Detection & i18n ==========
    var LANG_STORAGE_KEY = 'victorAI_language';

    function detectLanguage() {
        try {
            var saved = localStorage.getItem(LANG_STORAGE_KEY);
            if (saved === 'en' || saved === 'zh-TW') return saved;
        } catch (e) {}
        var navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (navLang.startsWith('en')) return 'en';
        return 'zh-TW';
    }

    var currentLang = detectLanguage();

    function saveLangPreference(lang) {
        try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) {}
    }

    var LANG_UI = {
        'zh-TW': {
            chatTitle: 'Victor 玄學助手',
            statusOnline: '在線為您服務',
            clearBtn: '清除',
            clearTitle: '清除對話',
            closeTitle: '關閉',
            langToggle: 'EN',
            langToggleTitle: 'Switch to English',
            welcomeText: '您好！我是 Victor 的智能助手<br>專門解答風水玄學問題，並推薦合適的專業服務',
            placeholder: '輸入您的問題...',
            quickQ1: '如何改善家居風水？',
            quickQ2: '如何預約命理分析？',
            quickQ3: '辦公室風水要注意什麼？',
            quickQ4: 'Victor 提供什麼服務？',
            errorGeneric: '抱歉，系統出現錯誤。',
            errorNetwork: '無法連接到 API 服務器。請檢查網絡連接或稍後再試。',
            errorContact: '\n\n請聯絡 Victor：\nWhatsApp: 6188 3889 / 66381789\n微信: victor3889',
            systemBaziPrefix: '📊 **系統精確八字計算結果（請以此為準）：**\n\n',
            systemBaziSuffix: '\n\n---\n\n以下是 Victor 玄學助手的進一步解讀：'
        },
        'en': {
            chatTitle: 'Victor AI Assistant',
            statusOnline: 'Online - Ready to help',
            clearBtn: 'Clear',
            clearTitle: 'Clear conversation',
            closeTitle: 'Close',
            langToggle: '中',
            langToggleTitle: '切換至中文',
            welcomeText: 'Hello! I\'m Victor\'s AI assistant.<br>I specialize in Feng Shui, divination, and metaphysical consultations.',
            placeholder: 'Type your question...',
            quickQ1: 'How to improve home Feng Shui?',
            quickQ2: 'How to book a consultation?',
            quickQ3: 'Office Feng Shui tips?',
            quickQ4: 'What services does Victor offer?',
            errorGeneric: 'Sorry, a system error occurred.',
            errorNetwork: 'Unable to connect to the server. Please check your network or try again later.',
            errorContact: '\n\nContact Victor:\nWhatsApp: +852 6188 3889 / +852 6638 1789\nWeChat: victor3889',
            systemBaziPrefix: '📊 **System-Calculated Bazi (Authoritative):**\n\n',
            systemBaziSuffix: '\n\n---\n\nVictor AI\'s interpretation below:'
        }
    };

    function t(key) {
        var lang = LANG_UI[currentLang] || LANG_UI['en'];
        return lang[key] || LANG_UI['en'][key] || key;
    }

    // ========== 配置區域 ==========
    var CONFIG = {
        apiBackend: 'https://poe-api-backend.vercel.app',
        botName: 'Gemini-2.5-Flash',

        // 【v2.9 升級】加入 flyingStarData 參數
        promptTemplate: function(userMessage, systemBazi, flyingStarData) {
            var langInstruction = {
                'zh-TW': '請使用繁體中文回答。語氣親切熱情，像朋友聊天。',
                'en': 'Please respond in English. Be warm, friendly, and professional.'
            };
            var closingLine = {
                'zh-TW': '「想了解更多？歡迎繼續問我，或 WhatsApp 6188 3889 預約 Victor 師傅親自解答！」',
                'en': '"Want to learn more? Feel free to ask, or WhatsApp +852 6188 3889 to book a personal consultation with Master Victor!"'
            };
            var freeTrialTexts = {
                'zh-TW': '當客人問「有冇免費」「有冇優惠」「可唔可以試下」「免費試用」等時，才告訴他們：\n🎁 首次使用智慧起卦服務，可獲得 **3次免費起卦碼** 試用！\n- 只需 WhatsApp 6188 3889 說明想試用\n- 體驗網址：https://hexagram-api.vercel.app/\n- 此優惠只限首次使用的新客人\n⚠️ 如果客人沒有主動問免費/優惠，不要主動提及！',
                'en': 'Only when the client asks about "free", "trial", "discount", "promotion", etc., tell them:\n🎁 First-time users can get **3 free divination codes** to try!\n- Just WhatsApp +852 6188 3889 to request a trial\n- Try it at: https://hexagram-api.vercel.app/\n- This offer is for first-time users only\n⚠️ Do NOT mention this offer unless the client asks about free/discounts!'
            };

            var li = langInstruction[currentLang] || langInstruction['en'];
            var cl = closingLine[currentLang] || closingLine['en'];
            var ft = freeTrialTexts[currentLang] || freeTrialTexts['en'];

            var localTime = getLocalTime();

            var mainPrompt = 'You are "Victor\'s Metaphysics Assistant", a professional AI assistant for Victor Fengshui & Divination.\n\n' +
                '【CRITICAL RULE: BAZI CALCULATION】\n' +
                'You MUST NEVER calculate Bazi (八字/Four Pillars) yourself. The system has already calculated and DISPLAYED the correct Bazi to the user. Your job is ONLY to interpret it. NEVER output your own Bazi pillars - they will be wrong. Always reference the system result.\n\n' +
                '【Current Date and Time】\n' +
                'Now is: ' + localTime + '\n' +
                '2025=蛇年, 2026=馬年, 2027=羊年.\n\n' +
                '【Language】\n' + li + '\n\n' +
                '【Personality】\n' +
                '- Warm and proactive, like a knowledgeable friend\n' +
                '- 150-250 words responses\n' +
                '- End with invitation to chat or book\n\n' +
                '【Service Prices】\n' +
                '🏠 Feng Shui Layout: HK$8,800 — https://victorlau.myqnapcloud.com/inprice7.htm\n' +
                '🏢 Property Rating: HK$1,800 / $2,800 / $4,800+ — https://victorlau.myqnapcloud.com/inprice13.htm\n' +
                '📅 Date Selection: HK$2,800 — https://victorlau.myqnapcloud.com/inprice9.htm\n' +
                '✏️ Name Analysis: HK$4,800 / $6,800 — https://victorlau.myqnapcloud.com/inprice10.htm\n' +
                '📱 Phone Number: HK$4,800 — https://victorlau.myqnapcloud.com/inprice6.htm\n' +
                '🔮 Qi Men Dun Jia: HK$2,800 — https://victorlau.myqnapcloud.com/inprice11.htm\n' +
                '⭐ Annual Fortune: HK$1,500 — https://victorlau.myqnapcloud.com/inprice12.htm\n' +
                '🎲 AI I-Ching: HK$399 / $1,000 bundle — https://hexagram-api.vercel.app/\n' +
                '💼 Consultation: HK$880/hr (was $1,000)\n\n' +
                '【Response Rules】\n' +
                '1. Quote prices when asked\n' +
                '2. Don\'t recommend crystals/ornaments\n' +
                '3. Free trial: ' + ft + '\n' +
                '4. End with: ' + cl + '\n' +
                '5. If asked about your AI model, say "Victor玄學助手" only.\n\n' +
                '【Victor\'s Info】\n' +
                '20+ years experience. Address: 3/F, Prospect Commercial Building, 8 Hysan Avenue, Causeway Bay, HK\n' +
                'WhatsApp: +852 6188 3889 / +852 6638 1789\n\n';

            // 附加八字資料
            var baziSection = '';
            if (systemBazi) {
                baziSection =
                    '\n========================================\n' +
                    '⚠️ SYSTEM-CALCULATED BAZI (DO NOT MODIFY)\n' +
                    '========================================\n' +
                    'The following Bazi has been precisely calculated by lunar-javascript and ALREADY SHOWN to the user. You MUST quote these exact pillars without any change:\n\n' +
                    systemBazi + '\n\n' +
                    '⚠️ Your task: INTERPRET the above Bazi (五行強弱、用神、性格、事業、感情等). DO NOT recalculate. DO NOT output different pillars. Reference the exact pillars above.\n' +
                    '========================================\n\n';
            }

            // 【新增】附加飛星風水資料
            var fsSection = '';
            if (flyingStarData) {
                 fsSection = '\n========================================\n' +
                    '⚠️ SYSTEM-CALCULATED FLYING STARS (DO NOT MODIFY)\n' +
                    '========================================\n' +
                    '【系統自動計算的流年飛星資料】以下是精確計算的 ' + flyingStarData.year + ' 年流年九宮飛星完整資料，請務必基於此為客戶解答。\n\n' +
                    flyingStarData.gridText + '\n\n' +
                    '⚠️ Your task: Answer the user\'s Feng Shui questions based on the above exact data. DO NOT mention that this data is provided by the system.\n' +
                    '========================================\n\n';
            }

            return mainPrompt + baziSection + fsSection + '【Client Question】\n' + userMessage;
        }
    };

    // 載入 marked.js
    var markedScript = document.createElement('script');
    markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    document.head.appendChild(markedScript);

    // 插入 CSS
    var style = document.createElement('style');
    style.textContent = `
        :root {
            --victor-primary: #5D5CDE;
            --victor-primary-dark: #4a49b0;
            --victor-primary-light: #7876ff;
            --victor-secondary: #ff9900;
            --victor-success: #10b981;
        }

        .victor-chat-trigger {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--victor-primary) 0%, var(--victor-primary-light) 100%);
            box-shadow: 0 8px 32px rgba(93, 92, 222, 0.3);
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999999;
            border: 3px solid rgba(255, 255, 255, 0.3);
            touch-action: none;
            user-select: none;
        }

        .victor-chat-trigger:hover {
            box-shadow: 0 12px 48px rgba(93, 92, 222, 0.4);
        }

        .victor-chat-trigger.dragging {
            cursor: grabbing;
            box-shadow: 0 16px 64px rgba(93, 92, 222, 0.5);
            transform: scale(1.1);
        }

        .victor-chat-trigger.faded {
            opacity: 0.3;
            transition: opacity 0.5s ease;
        }

        .victor-chat-trigger .icon-close { display: none; }

        .victor-chat-trigger.active {
            opacity: 0;
            pointer-events: none;
            transform: scale(0);
            transition: all 0.3s ease;
        }

        .victor-chat-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 20px;
            height: 20px;
            background: var(--victor-secondary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 700;
            border: 2px solid white;
            animation: victorPulse 2s infinite;
        }

        @keyframes victorPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }

        .victor-chat-window {
            position: fixed;
            top: 50%;
            right: 100px;
            transform: translateY(-50%);
            width: 400px;
            max-width: calc(100vw - 120px);
            height: 600px;
            max-height: calc(100vh - 100px);
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(93, 92, 222, 0.3);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 999998;
            animation: victorSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .victor-chat-window.active { display: flex; }

        @keyframes victorSlideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .victor-chat-header {
            background: linear-gradient(135deg, var(--victor-primary) 0%, var(--victor-primary-light) 100%);
            color: white;
            padding: 0.6rem 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            position: relative;
            overflow: hidden;
            cursor: move;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
        }

        .victor-chat-header::before {
            content: '☯';
            position: absolute;
            font-size: 120px;
            opacity: 0.05;
            right: -30px;
            top: -40px;
            transform: rotate(-15deg);
            pointer-events: none;
        }

        .victor-chat-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .victor-chat-info { flex: 1; min-width: 0; }

        .victor-header-buttons {
            display: flex;
            gap: 0.35rem;
            flex-shrink: 0;
            align-items: center;
        }

        .victor-lang-btn {
            background: rgba(255, 255, 255, 0.25);
            border: 2px solid rgba(255, 255, 255, 0.4);
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            font-weight: 700;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            -webkit-tap-highlight-color: rgba(255, 255, 255, 0.3);
            touch-action: manipulation;
        }

        .victor-lang-btn:hover { background: rgba(255, 255, 255, 0.4); transform: scale(1.1); }
        .victor-lang-btn:active { transform: scale(0.95); }

        .victor-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: 300;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-height: 36px;
            min-width: 36px;
            -webkit-tap-highlight-color: rgba(255, 255, 255, 0.3);
            touch-action: manipulation;
            pointer-events: auto;
            line-height: 1;
        }

        .victor-close-btn:hover { background: rgba(255, 255, 255, 0.35); transform: scale(1.1); }
        .victor-close-btn:active { background: rgba(255, 255, 255, 0.5); transform: scale(0.9); }

        .victor-clear-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 0.4rem 0.6rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.3rem;
            flex-shrink: 0;
            min-height: 36px;
            -webkit-tap-highlight-color: rgba(255, 87, 87, 0.3);
            touch-action: manipulation;
        }

        .victor-clear-btn:hover {
            background: rgba(255, 87, 87, 0.9);
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .victor-clear-btn:active, .victor-clear-btn:focus {
            background: rgba(255, 87, 87, 0.95);
            transform: scale(0.95);
            box-shadow: 0 2px 8px rgba(255, 87, 87, 0.5);
        }

        .victor-chat-title {
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 0.1rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .victor-chat-status {
            font-size: 11px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }

        .victor-status-dot {
            width: 8px;
            height: 8px;
            background: var(--victor-success);
            border-radius: 50%;
            animation: victorBlink 2s infinite;
        }

        @keyframes victorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .victor-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .victor-chat-messages::-webkit-scrollbar { width: 6px; }
        .victor-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .victor-chat-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

        .victor-message {
            display: flex;
            gap: 0.75rem;
            animation: victorMessageSlide 0.3s ease-out;
        }

        @keyframes victorMessageSlide {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .victor-message.user { flex-direction: row-reverse; }

        .victor-message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .victor-message.user .victor-message-avatar {
            background: linear-gradient(135deg, var(--victor-secondary) 0%, #ffb84d 100%);
            color: white;
        }

        .victor-message.assistant .victor-message-avatar {
            background: linear-gradient(135deg, var(--victor-primary) 0%, var(--victor-primary-light) 100%);
            color: white;
        }

        .victor-message-bubble {
            max-width: 75%;
            padding: 0.875rem 1.125rem;
            border-radius: 16px;
            line-height: 1.6;
            font-size: 15px;
        }

        .victor-message.user .victor-message-bubble {
            background: white;
            color: #1f2937;
            border-bottom-right-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .victor-message.assistant .victor-message-bubble {
            background: white;
            color: #1f2937;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .victor-message-bubble h1, .victor-message-bubble h2, .victor-message-bubble h3 {
            font-size: 1em;
            font-weight: 600;
            color: var(--victor-primary);
            margin-top: 0.5em;
            margin-bottom: 0.3em;
        }

        .victor-message-bubble ul, .victor-message-bubble ol {
            margin-left: 1.2em;
            margin-top: 0.3em;
        }

        .victor-message-bubble strong { color: var(--victor-primary); font-weight: 600; }
        .victor-message-bubble p { margin: 0.5em 0; }
        .victor-message-bubble p:first-child { margin-top: 0; }
        .victor-message-bubble p:last-child { margin-bottom: 0; }

        .victor-bazi-system-msg {
            background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
            border-left: 4px solid var(--victor-secondary);
        }

        .victor-typing-indicator {
            display: flex;
            gap: 0.375rem;
            padding: 0.5rem 0;
        }

        .victor-typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #6b7280;
            animation: victorTypingBounce 1.4s infinite;
        }

        .victor-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .victor-typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes victorTypingBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-8px); opacity: 1; }
        }

        .victor-welcome-message { text-align: center; padding: 2rem 1rem; }

        .victor-welcome-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: victorWelcomeFloat 3s ease-in-out infinite;
        }

        @keyframes victorWelcomeFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        .victor-welcome-text {
            font-size: 15px;
            color: #6b7280;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .victor-quick-questions { display: flex; flex-direction: column; gap: 0.5rem; }

        .victor-quick-btn {
            padding: 0.75rem 1rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            color: #1f2937;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .victor-quick-btn:hover {
            background: var(--victor-primary);
            color: white;
            border-color: var(--victor-primary);
            transform: translateX(4px);
        }

        .victor-chat-input-area {
            padding: 1rem 1.5rem;
            background: white;
            border-top: 1px solid #e5e7eb;
        }

        .victor-input-wrapper { display: flex; gap: 0.75rem; align-items: flex-end; }

        .victor-user-input {
            flex: 1;
            padding: 0.875rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            font-family: 'Noto Sans TC', sans-serif;
            resize: none;
            max-height: 100px;
            transition: all 0.2s;
            background: #f8f9fa;
        }

        .victor-user-input:focus {
            outline: none;
            border-color: var(--victor-primary);
            background: white;
        }

        .victor-send-btn {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, var(--victor-primary) 0%, var(--victor-primary-light) 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .victor-send-btn:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .victor-send-btn:active:not(:disabled) { transform: scale(0.95); }
        .victor-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .victor-error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 14px;
            border-left: 3px solid #dc2626;
        }

        @media (max-width: 480px) {
            .victor-chat-window {
                position: fixed;
                top: 0; bottom: 0; right: 0; left: 0;
                width: 100%; max-width: 100%;
                height: 100%; max-height: 100%;
                border-radius: 0;
                transform: none;
                padding-top: env(safe-area-inset-top, 0);
                padding-bottom: env(safe-area-inset-bottom, 0);
            }
            .victor-chat-header {
                padding-top: calc(1.25rem + env(safe-area-inset-top, 0));
                min-height: 70px;
            }
            .victor-clear-btn {
                min-height: 52px;
                min-width: 100px;
                padding: 0.875rem 1.5rem;
                font-size: 16px;
            }
            .victor-chat-trigger {
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                font-size: 24px;
            }
            .victor-message-bubble { max-width: 85%; }
            .victor-chat-input-area {
                padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
            }
        }
    `;
    document.head.appendChild(style);

    function buildWelcomeHTML() {
        return '<div class="victor-welcome-message">' +
            '<div class="victor-welcome-icon">🌟</div>' +
            '<div class="victor-welcome-text">' + t('welcomeText') + '</div>' +
            '<div class="victor-quick-questions">' +
                '<div class="victor-quick-btn" onclick="VictorAI.askQuestion(\'' + t('quickQ1').replace(/'/g, "\\'") + '\')">' +
                    '<span>🏠</span><span>' + t('quickQ1') + '</span></div>' +
                '<div class="victor-quick-btn" onclick="VictorAI.askQuestion(\'' + t('quickQ2').replace(/'/g, "\\'") + '\')">' +
                    '<span>⭐</span><span>' + t('quickQ2') + '</span></div>' +
                '<div class="victor-quick-btn" onclick="VictorAI.askQuestion(\'' + t('quickQ3').replace(/'/g, "\\'") + '\')">' +
                    '<span>🏢</span><span>' + t('quickQ3') + '</span></div>' +
                '<div class="victor-quick-btn" onclick="VictorAI.askQuestion(\'' + t('quickQ4').replace(/'/g, "\\'") + '\')">' +
                    '<span>❓</span><span>' + t('quickQ4') + '</span></div>' +
            '</div></div>';
    }

    var html = '<div class="victor-chat-trigger" id="victorChatTrigger">' +
            '<span class="icon-open">🔮</span>' +
            '<span class="icon-close">✕</span>' +
            '<div class="victor-chat-badge">AI</div>' +
        '</div>' +
        '<div class="victor-chat-window" id="victorChatWindow">' +
            '<div class="victor-chat-header" id="victorChatHeader">' +
                '<div class="victor-chat-avatar">🔮</div>' +
                '<div class="victor-chat-info">' +
                    '<div class="victor-chat-title">' + t('chatTitle') + '</div>' +
                    '<div class="victor-chat-status">' +
                        '<span class="victor-status-dot"></span>' +
                        '<span>' + t('statusOnline') + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="victor-header-buttons">' +
                    '<button id="victorCloseBtn" class="victor-close-btn" title="' + t('closeTitle') + '">✕</button>' +
                    '<button id="victorLangBtn" class="victor-lang-btn" title="' + t('langToggleTitle') + '">' +
                        t('langToggle') +
                    '</button>' +
                    '<button id="victorClearBtn" class="victor-clear-btn" title="' + t('clearTitle') + '">' +
                        '<span>🗑️</span>' +
                        '<span>' + t('clearBtn') + '</span>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="victor-chat-messages" id="victorChatMessages">' +
                buildWelcomeHTML() +
            '</div>' +
            '<div class="victor-chat-input-area">' +
                '<div class="victor-input-wrapper">' +
                    '<textarea id="victorUserInput" class="victor-user-input" placeholder="' + t('placeholder') + '" rows="1"></textarea>' +
                    '<button id="victorSendBtn" class="victor-send-btn">✈️</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.insertAdjacentHTML('beforeend', html);
            initVictorAI();
        });
    } else {
        document.body.insertAdjacentHTML('beforeend', html);
        initVictorAI();
    }

    function initVictorAI() {
        var isProcessing = false;
        console.log('[Victor AI] v' + VICTOR_AI_VERSION + ' 初始化中...');

        var STORAGE_KEY = 'victorAI_conversation';
        var STORAGE_EXPIRY_DAYS = 30;

        function loadConversationHistory() {
            try {
                var stored = localStorage.getItem(STORAGE_KEY);
                if (!stored) return [];
                var data = JSON.parse(stored);
                var now = new Date().getTime();
                if (data.timestamp && (now - data.timestamp) > (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)) {
                    localStorage.removeItem(STORAGE_KEY);
                    return [];
                }
                return data.history || [];
            } catch (e) {
                return [];
            }
        }

        function saveConversationHistory(history) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({history: history, timestamp: new Date().getTime()}));
            } catch (e) {}
        }

        function escapeHtml(text) {
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function scrollToBottom() {
            var messagesContainer = document.getElementById('victorChatMessages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        var conversationHistory = loadConversationHistory();

        function restoreConversationUI() {
            if (conversationHistory.length === 0) return;
            var messagesContainer = document.getElementById('victorChatMessages');
            var welcome = messagesContainer.querySelector('.victor-welcome-message');
            if (welcome) welcome.remove();

            conversationHistory.forEach(function(item) {
                if (item.role === 'user') {
                    var d = document.createElement('div');
                    d.className = 'victor-message user';
                    d.innerHTML = '<div class="victor-message-avatar">👤</div><div class="victor-message-bubble">' + escapeHtml(item.content) + '</div>';
                    messagesContainer.appendChild(d);
                } else {
                    var d = document.createElement('div');
                    d.className = 'victor-message assistant';
                    var rendered = window.marked ? marked.parse(item.content) : item.content;
                    d.innerHTML = '<div class="victor-message-avatar">🔮</div><div class="victor-message-bubble">' + rendered + '</div>';
                    messagesContainer.appendChild(d);
                }
            });
            scrollToBottom();
        }

        restoreConversationUI();

        // ===== 拖動功能 =====
        var trigger = document.getElementById('victorChatTrigger');
        var POSITION_KEY = 'victorAI_buttonPosition';
        var isDragging = false;
        var startX, startY, startLeft, startBottom;
        var hasMoved = false;
        var fadeTimer = null;

        function startFadeTimer() {
            if (fadeTimer) clearTimeout(fadeTimer);
            trigger.classList.remove('faded');
            fadeTimer = setTimeout(function() { trigger.classList.add('faded'); }, 3000);
        }

        function resetFade() {
            trigger.classList.remove('faded');
            startFadeTimer();
        }

        startFadeTimer();

        function loadButtonPosition() {
            try {
                var saved = localStorage.getItem(POSITION_KEY);
                if (saved) {
                    var pos = JSON.parse(saved);
                    trigger.style.bottom = pos.bottom + 'px';
                    trigger.style.right = pos.right + 'px';
                }
            } catch (e) {}
        }

        function saveButtonPosition(bottom, right) {
            try {
                localStorage.setItem(POSITION_KEY, JSON.stringify({bottom: bottom, right: right}));
            } catch (e) {}
        }

        loadButtonPosition();

        function onDragStart(e) {
            isDragging = true;
            hasMoved = false;
            trigger.classList.add('dragging');
            resetFade();
            var clientX = e.type.indexOf('touch') !== -1 ? e.touches[0].clientX : e.clientX;
            var clientY = e.type.indexOf('touch') !== -1 ? e.touches[0].clientY : e.clientY;
            startX = clientX;
            startY = clientY;
            var cs = window.getComputedStyle(trigger);
            startLeft = parseInt(cs.right);
            startBottom = parseInt(cs.bottom);
            e.preventDefault();
        }

        function onDragMove(e) {
            if (!isDragging) return;
            var clientX = e.type.indexOf('touch') !== -1 ? e.touches[0].clientX : e.clientX;
            var clientY = e.type.indexOf('touch') !== -1 ? e.touches[0].clientY : e.clientY;
            var deltaX = clientX - startX;
            var deltaY = clientY - startY;
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) hasMoved = true;
            var newRight = Math.max(0, Math.min(window.innerWidth - trigger.offsetWidth, startLeft - deltaX));
            var newBottom = Math.max(0, Math.min(window.innerHeight - trigger.offsetHeight, startBottom - deltaY));
            trigger.style.right = newRight + 'px';
            trigger.style.bottom = newBottom + 'px';
            e.preventDefault();
        }

        function onDragEnd(e) {
            if (isDragging) {
                isDragging = false;
                trigger.classList.remove('dragging');
                if (!hasMoved) {
                    toggleChatWindow();
                } else {
                    saveButtonPosition(parseInt(trigger.style.bottom), parseInt(trigger.style.right));
                }
                hasMoved = false;
            }
        }

        function openChatWindow() {
            var chatWindow = document.getElementById('victorChatWindow');
            if (chatWindow.classList.contains('active')) return;
            chatWindow.style.top = '50%';
            chatWindow.style.left = '';
            chatWindow.style.right = '100px';
            chatWindow.style.transform = 'translateY(-50%)';
            chatWindow.classList.add('active');
            trigger.classList.add('active');
            setTimeout(function() { document.getElementById('victorUserInput').focus(); }, 100);
        }

        function closeChatWindow() {
            var chatWindow = document.getElementById('victorChatWindow');
            if (!chatWindow.classList.contains('active')) return;
            chatWindow.classList.remove('active');
            trigger.classList.remove('active');
            chatWindow.style.top = '50%';
            chatWindow.style.left = '';
            chatWindow.style.right = '100px';
            chatWindow.style.transform = 'translateY(-50%)';
        }

        function toggleChatWindow() {
            var chatWindow = document.getElementById('victorChatWindow');
            if (chatWindow.classList.contains('active')) closeChatWindow();
            else openChatWindow();
        }

        trigger.addEventListener('mousedown', onDragStart);
        trigger.addEventListener('touchstart', onDragStart, {passive: false});
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('touchmove', onDragMove, {passive: false});
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd);

        // ===== 視窗拖動 =====
        var chatHeader = document.getElementById('victorChatHeader');
        var chatWindow = document.getElementById('victorChatWindow');
        var winDragging = false;
        var winStartX, winStartY, winStartTop, winStartLeft;

        function onWindowDragStart(e) {
            if (e.target.closest('button')) return;
            winDragging = true;
            chatHeader.style.cursor = 'grabbing';
            var clientX = e.type.indexOf('touch') !== -1 ? e.touches[0].clientX : e.clientX;
            var clientY = e.type.indexOf('touch') !== -1 ? e.touches[0].clientY : e.clientY;
            winStartX = clientX;
            winStartY = clientY;
            var rect = chatWindow.getBoundingClientRect();
            winStartTop = rect.top;
            winStartLeft = rect.left;
            chatWindow.style.top = rect.top + 'px';
            chatWindow.style.left = rect.left + 'px';
            chatWindow.style.right = 'auto';
            chatWindow.style.transform = 'none';
            e.preventDefault();
        }

        function onWindowDragMove(e) {
            if (!winDragging) return;
            var clientX = e.type.indexOf('touch') !== -1 ? e.touches[0].clientX : e.clientX;
            var clientY = e.type.indexOf('touch') !== -1 ? e.touches[0].clientY : e.clientY;
            var deltaX = clientX - winStartX;
            var deltaY = clientY - winStartY;
            var newTop = Math.max(0, Math.min(window.innerHeight - 80, winStartTop + deltaY));
            var newLeft = Math.max(-chatWindow.offsetWidth + 80, Math.min(window.innerWidth - 80, winStartLeft + deltaX));
            chatWindow.style.top = newTop + 'px';
            chatWindow.style.left = newLeft + 'px';
            e.preventDefault();
        }

        function onWindowDragEnd() {
            if (winDragging) {
                winDragging = false;
                chatHeader.style.cursor = 'move';
            }
        }

        chatHeader.addEventListener('mousedown', onWindowDragStart);
        chatHeader.addEventListener('touchstart', onWindowDragStart, {passive: false});
        document.addEventListener('mousemove', onWindowDragMove);
        document.addEventListener('touchmove', onWindowDragMove, {passive: false});
        document.addEventListener('mouseup', onWindowDragEnd);
        document.addEventListener('touchend', onWindowDragEnd);

        var closeBtnEl = document.getElementById('victorCloseBtn');
        function doCloseChat() { closeChatWindow(); }
        closeBtnEl.addEventListener('click', doCloseChat);
        closeBtnEl.addEventListener('touchstart', function(e) {
            e.preventDefault(); e.stopPropagation(); doCloseChat();
        }, {passive: false});

        document.getElementById('victorSendBtn').addEventListener('click', sendMessage);

        document.getElementById('victorLangBtn').addEventListener('click', function() {
            currentLang = (currentLang === 'zh-TW') ? 'en' : 'zh-TW';
            saveLangPreference(currentLang);
            document.querySelector('.victor-chat-title').textContent = t('chatTitle');
            document.querySelector('.victor-chat-status span:last-child').textContent = t('statusOnline');
            var langBtn = document.getElementById('victorLangBtn');
            langBtn.textContent = t('langToggle');
            langBtn.title = t('langToggleTitle');
            document.getElementById('victorCloseBtn').title = t('closeTitle');
            var clearBtn = document.getElementById('victorClearBtn');
            clearBtn.title = t('clearTitle');
            clearBtn.querySelector('span:last-child').textContent = t('clearBtn');
            document.getElementById('victorUserInput').placeholder = t('placeholder');
            var welcome = document.querySelector('.victor-welcome-message');
            if (welcome) {
                document.getElementById('victorChatMessages').innerHTML = buildWelcomeHTML();
            }
        });

        var clearBtnEl = document.getElementById('victorClearBtn');
        var clearDebounce = false;
        function doClearChat() {
            if (clearDebounce) return;
            clearDebounce = true;
            setTimeout(function() { clearDebounce = false; }, 150);
            conversationHistory = [];
            try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
            document.getElementById('victorChatMessages').innerHTML = buildWelcomeHTML();
            isProcessing = false;
        }
        clearBtnEl.addEventListener('click', doClearChat);
        clearBtnEl.addEventListener('touchstart', function(e) {
            e.preventDefault(); e.stopPropagation(); doClearChat();
        }, {passive: false});

        var userInput = document.getElementById('victorUserInput');
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });

        // ========== 【v2.9 核心修正】sendMessage 函數 ==========
        function sendMessage() {
            var input = document.getElementById('victorUserInput');
            var message = input.value.trim();
            if (!message || isProcessing) return;

            displayUserMessage(message);
            input.value = '';
            input.style.height = 'auto';

            // ===== 【新增】攔截風水飛星問題 =====
            var flyingStarData = null;
            var fengShuiKeywords = ['流年', '飛星', '中宮', '風水', '今年', '方位', '佈局', '化解', '催旺', '煞氣', '五黃', '二黑', '財位', '桃花', '文昌', '九紫', '八白', '玄空'];
            var hasFengShui = fengShuiKeywords.some(function(kw) { return message.indexOf(kw) !== -1; });
            if (hasFengShui) {
                console.log('[Victor AI] 攔截風水問題，載入流年飛星資料');
                flyingStarData = getYearFlyingStars();
            }

            // ===== 攔截八字問題，先直接顯示系統計算結果 =====
            var systemBaziResult = null;
            var dateMatch = message.match(/(\d{4})\s*[年\-\/.]\s*(\d{1,2})\s*[月\-\/.]\s*(\d{1,2})/);
            var isBaziQuery = /八字|四柱|時柱|日柱|月柱|年柱|命盤|命格|生辰/.test(message);

            if (dateMatch && isBaziQuery && typeof Lunar !== 'undefined') {
                var parsed = parseTimeFromMessage(message);
                var dateStr = dateMatch[1] + '-' + dateMatch[2] + '-' + dateMatch[3];
                console.log('[Victor AI] 攔截八字問題: dateStr=' + dateStr + ', hour=' + parsed.hour + ', min=' + parsed.min);
                systemBaziResult = getBaziFromDate(dateStr, parsed.hour, parsed.min);

                if (systemBaziResult) {
                    // 直接在聊天視窗顯示系統計算結果（不經 AI）
                    displaySystemBaziMessage(t('systemBaziPrefix') + systemBaziResult + t('systemBaziSuffix'));
                }
            }
            // ===== 結束 =====

            isProcessing = true;
            updateSendButton(true);
            displayLoadingMessage();

            var contextPrompt = '';
            if (conversationHistory.length > 0) {
                contextPrompt = '【Conversation History】\n';
                for (var i = 0; i < conversationHistory.length; i++) {
                    var item = conversationHistory[i];
                    contextPrompt += (item.role === 'user' ? 'Client' : 'Assistant') + ': ' + item.content + '\n';
                }
                contextPrompt += '\n';
            }

            // 【v2.9 升級】把 flyingStarData 傳給 promptTemplate
            var prompt = CONFIG.promptTemplate(message, systemBaziResult, flyingStarData);
            var fullPrompt = contextPrompt + prompt;

            console.log('[Victor AI] 模型:', CONFIG.botName, '| 歷史:', conversationHistory.length, '| 八字:', !!systemBaziResult, '| 飛星:', !!flyingStarData);

            fetch(CONFIG.apiBackend + '/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    model: CONFIG.botName,
                    message: fullPrompt
                })
            })
            .then(function(response) {
                if (!response.ok) {
                    return response.text().then(function(errorText) {
                        throw new Error('API 請求失敗 (' + response.status + '): ' + errorText.substring(0, 100));
                    });
                }
                return response.json();
            })
            .then(function(data) {
                removeLoadingMessage();
                var assistantResponse = data.response || data.text || '';
                if (!assistantResponse) throw new Error('無效的回應格式');

                displayAssistantMessage(assistantResponse);

                // 保存歷史時，把系統八字或飛星資料作為「權威來源」一併保存，避免下次被 AI 錯誤答案污染
                conversationHistory.push({ role: 'user', content: message });
                var historyContent = assistantResponse;
                
                if (systemBaziResult) {
                    historyContent = '【系統八字（權威）】\n' + systemBaziResult + '\n\n【AI 解讀】\n' + historyContent;
                } else if (flyingStarData) {
                    historyContent = '【系統飛星（權威）】\n' + flyingStarData.year + '年：' + flyingStarData.centerName + '入中宮\n\n【AI 解讀】\n' + historyContent;
                }
                
                conversationHistory.push({ role: 'assistant', content: historyContent });
                saveConversationHistory(conversationHistory);
            })
            .catch(function(error) {
                console.error('[Victor AI] 錯誤:', error);
                removeLoadingMessage();
                var errorMessage = t('errorGeneric');
                if (error.message && (error.message.indexOf('Failed to fetch') !== -1 || error.message.indexOf('NetworkError') !== -1)) {
                    errorMessage = t('errorNetwork');
                } else if (error.message) {
                    errorMessage = error.message;
                }
                displayError(errorMessage + t('errorContact'));
            })
            .finally(function() {
                isProcessing = false;
                updateSendButton(false);
            });
        }

        function displayUserMessage(text) {
            var messagesContainer = document.getElementById('victorChatMessages');
            var welcome = messagesContainer.querySelector('.victor-welcome-message');
            if (welcome) welcome.remove();
            var d = document.createElement('div');
            d.className = 'victor-message user';
            d.innerHTML = '<div class="victor-message-avatar">👤</div><div class="victor-message-bubble">' + escapeHtml(text) + '</div>';
            messagesContainer.appendChild(d);
            scrollToBottom();
        }

        function displaySystemBaziMessage(content) {
            var messagesContainer = document.getElementById('victorChatMessages');
            var d = document.createElement('div');
            d.className = 'victor-message assistant';
            var rendered = window.marked ? marked.parse(content) : content.replace(/\n/g, '<br>');
            d.innerHTML = '<div class="victor-message-avatar">📊</div>' +
                '<div class="victor-message-bubble victor-bazi-system-msg">' + rendered + '</div>';
            messagesContainer.appendChild(d);
            scrollToBottom();
        }

        function displayLoadingMessage() {
            var messagesContainer = document.getElementById('victorChatMessages');
            var d = document.createElement('div');
            d.className = 'victor-message assistant';
            d.id = 'victorLoadingMessage';
            d.innerHTML = '<div class="victor-message-avatar">🔮</div><div class="victor-message-bubble"><div class="victor-typing-indicator"><div class="victor-typing-dot"></div><div class="victor-typing-dot"></div><div class="victor-typing-dot"></div></div></div>';
            messagesContainer.appendChild(d);
            scrollToBottom();
        }

        function removeLoadingMessage() {
            var loading = document.getElementById('victorLoadingMessage');
            if (loading) loading.remove();
        }

        function displayAssistantMessage(content) {
            var messagesContainer = document.getElementById('victorChatMessages');
            var d = document.createElement('div');
            d.className = 'victor-message assistant';
            var rendered = window.marked ? marked.parse(content) : content;
            d.innerHTML = '<div class="victor-message-avatar">🔮</div><div class="victor-message-bubble">' + rendered + '</div>';
            messagesContainer.appendChild(d);
            scrollToBottom();
        }

        function displayError(errorText) {
            var messagesContainer = document.getElementById('victorChatMessages');
            var d = document.createElement('div');
            d.className = 'victor-message assistant';
            d.innerHTML = '<div class="victor-message-avatar">⚠️</div><div class="victor-message-bubble"><div class="victor-error-message">' + escapeHtml(errorText) + '</div></div>';
            messagesContainer.appendChild(d);
            scrollToBottom();
        }

        function updateSendButton(processing) {
            var btn = document.getElementById('victorSendBtn');
            btn.disabled = processing;
            btn.textContent = processing ? '⏳' : '✈️';
        }

        window.VictorAI = {
            askQuestion: function(question) {
                document.getElementById('victorUserInput').value = question;
                sendMessage();
            }
        };

        console.log('[Victor AI] v' + VICTOR_AI_VERSION + ' 初始化完成 ✅');
    }
})();
