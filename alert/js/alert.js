
(function () {
    'use strict';

    const CacheManager = {};

    const CacheManagerKeys = {
        OldOptions: 'OLD_OPTIONS_',
        IsAppendStyle: 'TZ_ALERT_IS_APPEND_STYLE',
    };

    const StorageManager = {
        set(key, value) {
            sessionStorage.setItem(key, JSON.stringify(value));
        },
        get(key) {
            let r = sessionStorage.getItem(key);
            return r == null ? null : JSON.parse(r);
        }
    };

    const RandomHelper = {
        renderIdKey: '',
        fnGenerateRandomId(type = 'guid') {
            switch (type) {
                case 'timespan':
                    this.renderIdKey = new Date().getTime();
                    break;
                case 'guid':
                    this.renderIdKey = this.fnGenerateRandomIdByGuid();
                    break;
            }
            StorageManager.set(this.renderIdKey, this.renderIdKey)
        },
        fnSetUserCustomId(id) {
            this.renderIdKey = id;
            StorageManager.set(this.renderIdKey, this.renderIdKey)
        },
        fnGenerateRandomIdByGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };

    const Timeout = {
        close: null,
        okTips: null,
    };

    const Utils = {
        fnDeepMerge(obj1, obj2, filter = []) {
            let key;
            for (key in obj2) {
                if (filter.includes(key)) continue;
                obj1[key] =
                    obj1[key] &&
                        obj1[key].toString() === "[object Object]" &&
                        (obj2[key] && obj2[key].toString() === "[object Object]")
                        ? this.fnDeepMerge(obj1[key], obj2[key], [])
                        : (obj1[key] = obj2[key]);
            }
            return obj1;
        },
    
        fnCheckCloneType(any) {
            return Object.prototype.toString.call(any).slice(8, -1);
        },
    
        fnDeepClone(any) {
            if (this.fnCheckCloneType(any) === 'Object') { 
                let o = {};
                for (let key in any) {
                    o[key] = this.fnDeepClone(any[key]);
                };
                return o;
            } else if (this.fnCheckCloneType(any) === 'Array') { 
                var arr = [];
                for (let i = 0, leng = any.length; i < leng; i++) {
                    arr[i] = this.fnDeepClone(any[i]);
                };
                return arr;
            } else if (this.fnCheckCloneType(any) === 'Function') { 
                return new Function('return ' + any.toString()).call(this);
            } else if (this.fnCheckCloneType(any) === 'Date') { 
                return new Date(any.valueOf());
            } else if (this.fnCheckCloneType(any) === 'RegExp') { 
                return new RegExp(any);
            } else if (this.fnCheckCloneType(any) === 'Map') { 
                let m = new Map();
                any.forEach((v, k) => {
                    m.set(k, this.fnDeepClone(v));
                });
                return m;
            } else if (this.fnCheckCloneType(any) === 'Set') { 
                let s = new Set();
                for (let val of any.values()) {
                    s.add(this.fnDeepClone(val));
                }
                return s;
            }
            return any;
        },
      
        fnObjToStyleString(obj) {
            let s = '';
            for (let key in obj) {
                s += `${key}:${obj[key]};`
            }
            return s;
        }
    };

    // html helper
    const HtmlHelper = {
        
        buttonHtml(type, style, content) {
            switch (type) {
                case 'confirm':
                    return `<button class="alert-btn" id="AlertConfirm${RandomHelper.renderIdKey}" style="${style}">${content}</button>`;
                case 'cancel':
                    return `<button class="alert-btn" id="AlertCancel${RandomHelper.renderIdKey}" style="${style}">${content}</button>`;
            }
        },
        
        fnSetDom(ctx, elName, show, html = '') {
            if (show) {
                ctx.el[elName] && (ctx.el[elName].style.display = 'flex');
                ctx.el[elName] && (ctx.el[elName].innerHTML = (ctx.options[elName].html || '') + html);
            } else {
                ctx.el[elName] && (ctx.el[elName].style.display = 'none');
            }
        },
       
        diffRenderHtml(ctx) {
            let allStyles = this.fnGetStyles(ctx);
            ctx.el.alert.style = allStyles.alertStyle;
            ctx.el.title.style = allStyles.titleStyle;
            ctx.el.content.style = allStyles.contentStyle;
            ctx.el.tips.style = allStyles.tipsStyle;
            ctx.el.okTips.style = allStyles.okTipsStyle;
            ctx.el.bottom.style = allStyles.bottomStyle;
            ctx.el.mask && (ctx.el.mask.style = allStyles.maskStyle);

            let showTitle = ctx.options.title.html != '';
            let showContent = ctx.options.content.html != '';
            let showTips = ctx.options.tips.html != '';
            let showBottom = ctx.options.bottom.html != '';

            if (!showBottom) {
                showBottom = ctx.options.confirm.use || ctx.options.cancel.use;
            }
            let _defaultBtnHtml = '';
            if (ctx.options.cancel.use) {
                _defaultBtnHtml += HtmlHelper.buttonHtml('cancel', allStyles.cancelStyle, ctx.options.cancel.text);
            }
            if (ctx.options.confirm.use) {
                _defaultBtnHtml += HtmlHelper.buttonHtml('confirm', allStyles.confirmStyle, ctx.options.confirm.text);
            }
            HtmlHelper.fnSetDom(ctx, 'title', showTitle);
            HtmlHelper.fnSetDom(ctx, 'content', showContent);
            HtmlHelper.fnSetDom(ctx, 'tips', showTips);
            HtmlHelper.fnSetDom(ctx, 'bottom', showBottom, _defaultBtnHtml);

            this.fnCreateMask(ctx); 

            ctx.el.confirm = document.getElementById(`AlertConfirm${RandomHelper.renderIdKey}`); 
            ctx.el.cancel = document.getElementById(`AlertCancel${RandomHelper.renderIdKey}`);   

            EventHandler.fnBindEvents(ctx);
            ctx.status.show = true;

            if (ctx.options.onMounted && typeof ctx.options.onMounted === 'function') {
                setTimeout(function () { ctx.options.onMounted(); }, 0);
            }
        },
        
        fnCreateMask(ctx) {
            ctx.el.mask && ctx.el.mask.remove();
           
            if (ctx.options.mask.use) {
                const { maskStyle } = this.fnGetStyles(ctx);
                const mask = document.createElement('div');
                mask.setAttribute('id', `AlertMask${RandomHelper.renderIdKey}`);
                mask.className = 'alert-mask';
                mask.style = maskStyle;
                document.body.appendChild(mask);
                ctx.el.mask = document.getElementById(`AlertMask${RandomHelper.renderIdKey}`);
                
                if (ctx.options.useMaskClose) {
                    mask.onclick = function (e) {
                        e.preventDefault();
                        ctx.close();
                    };
                } else {
                    mask.onclick = null;
                }
            }
        },
        
        fnGetStyles(ctx) {
            
            let positionStyle = this.fnGetPositionStyle(ctx);
            let alertStyle = {
                width: ctx.options.width,
                top: ctx.options.top,
                'box-shadow': ctx.options.shadow,
                'border-radius': ctx.options.radius,
                'margin-left': - ctx.options.width.replace('px', '') / 2 + 'px',
            };
            alertStyle = Utils.fnDeepMerge(alertStyle, positionStyle); // 合并样式
            let titleStyle = {
                'justify-content': ctx.options.center ? 'center' : 'flex-start',
                'font-size': ctx.options.title.fontSize,
                'font-weight': ctx.options.title.fontWeight,
                'color': ctx.options.title.color,
            };
            let contentStyle = {
                'padding': ctx.options.content.padding,
                'justify-content': ctx.options.center ? 'center' : 'flex-start',
            };
            let tipsStyle = {
                'font-size': ctx.options.tips.fontSize,
                'font-weight': ctx.options.tips.fontWeight,
                'color': ctx.options.tips.color,
                'justify-content': ctx.options.center ? 'center' : 'flex-start',
            };
            let okTipsStyle = {
                'text-align': ctx.options.center ? 'center' : 'inherit',
            };
            let bottomStyle = {
                'justify-content': ctx.options.center ? 'center' : 'flex-end',
            };
            let confirmStyle = {
                '--textColor': ctx.options.confirm.textColor,
                '--bgColor': ctx.options.confirm.bgColor,
                '--shadow': ctx.options.confirm.shadow,
                'border-radius': ctx.options.confirm.radius,
                padding: ctx.options.confirm.padding,
                border: ctx.options.confirm.border,
            };
            let cancelStyle = {
                '--textColor': ctx.options.cancel.textColor,
                '--bgColor': ctx.options.cancel.bgColor,
                '--shadow': ctx.options.cancel.shadow,
                'border-radius': ctx.options.cancel.radius,
                padding: ctx.options.cancel.padding,
                border: ctx.options.cancel.border,
            };

            let maskStyle = {
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                background: ctx.options.mask.background,
            };

            alertStyle = Utils.fnObjToStyleString(alertStyle);
            titleStyle = Utils.fnObjToStyleString(titleStyle);
            contentStyle = Utils.fnObjToStyleString(contentStyle);
            tipsStyle = Utils.fnObjToStyleString(tipsStyle);
            okTipsStyle = Utils.fnObjToStyleString(okTipsStyle);
            bottomStyle = Utils.fnObjToStyleString(bottomStyle);
            confirmStyle = Utils.fnObjToStyleString(confirmStyle);
            cancelStyle = Utils.fnObjToStyleString(cancelStyle);
            maskStyle = Utils.fnObjToStyleString(maskStyle);

            return {
                alertStyle, titleStyle, contentStyle, tipsStyle,
                okTipsStyle, bottomStyle, confirmStyle, cancelStyle, maskStyle
            };
        },
       
        fnGetPositionStyle(ctx) {
            let _position = ctx.options.position; 
            let _gap = ctx.options.gap;           
            let _styles = {};            
            switch (_position) {
                case 'center':
                    _styles = {
                        left: '50%',
                        top: '50%',
                        right: 'initial',
                        bottom: 'initial',
                        transform: 'translate(-50%, -50%)'
                    };
                    break;
                case 'left':
                    _styles = {
                        left: _gap + 'px',
                        top: '50%',
                        right: 'initial',
                        bottom: 'initial',
                        transform: 'translateY(-50%)'
                    };
                    break;
                case 'left-top':
                    _styles = {
                        left: _gap + 'px',
                        top: _gap + 'px',
                        right: 'initial',
                        bottom: 'initial',
                    };
                    break;
                case 'left-bottom':
                    _styles = {
                        left: _gap + 'px',
                        top: 'initial',
                        right: 'initial',
                        bottom: _gap + 'px',
                    };
                    break;
                case 'top':
                    _styles = {
                        left: '50%',
                        top: _gap + 'px',
                        right: 'initial',
                        bottom: 'initial',
                        transform: 'translateX(-50%)'
                    };
                    break;

                case 'right':
                    _styles = {
                        left: 'initial',
                        top: '50%',
                        right: _gap + 'px',
                        bottom: 'initial',
                        transform: 'translateY(-50%)'
                    };
                    break;
                case 'right-top':
                    _styles = {
                        left: 'initial',
                        top: _gap + 'px',
                        right: _gap + 'px',
                        bottom: 'initial',
                    };
                    break;
                case 'right-bottom':
                    _styles = {
                        left: 'initial',
                        top: 'initial',
                        right: _gap + 'px',
                        bottom: _gap + 'px',
                    };
                    break;
                case 'bottom':
                    _styles = {
                        left: '50%',
                        top: 'initial',
                        right: 'initial',
                        bottom: _gap + 'px',
                        transform: 'translateX(-50%)'
                    };
                    break;
            }
            _styles['margin-left'] = 'initial';
            return _styles;
        },
    };


    const EventHandler = {

        fnOnDrop(ctx) {
            const _this = this;
            const alert = ctx.el.alert,
                title = ctx.el.title;

            let x, y; 
            let isDrop = false; 
            title.onmousedown = function (e) {
                title.style.cursor = 'move';
                var e = e || window.event; 
                x = e.clientX - alert.offsetLeft;
                y = e.clientY - alert.offsetTop;
                isDrop = true; 
            };
            document.onmousemove = function (e) {
                               　　　　　　　　　　　 　　　　　　　
                if (isDrop) {
                    var e = e || window.event;
                    var moveX = e.clientX - x;                     　　
                    var moveY = e.clientY - y; 
                    
                    var maxX = document.documentElement.clientWidth - alert.offsetWidth;  
                    var maxY = document.documentElement.clientHeight - alert.offsetHeight;

                    
                    _this.fnHandleDrawMove(ctx, alert, moveX, moveY, maxX, maxY);
                } else {
                    return;
                }
            };
            document.onmouseup = function () {
                isDrop = false; 
                title.style.cursor = 'initial';
            };
        },

    
        fnHandleDrawMove(ctx, alert, moveX, moveY, maxX, maxY) {
            let _position = ctx.options.position; // 位置
            switch (_position) {
                case 'center':
                    if (moveX > alert.offsetWidth / 2 && moveX < maxX + alert.offsetWidth / 2) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > alert.offsetHeight / 2 && moveY < maxY + alert.offsetHeight / 2) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'left':
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > alert.offsetHeight / 2 && moveY < maxY + alert.offsetHeight / 2) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'left-top':
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'left-bottom':
                    alert.style.bottom = 'initial';
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'top':
                    if (moveX > alert.offsetWidth / 2 && moveX < maxX + alert.offsetWidth / 2) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;

                case 'right':
                    alert.style.right = 'initial';
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > alert.offsetHeight / 2 && moveY < maxY + alert.offsetHeight / 2) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'right-top':
                    alert.style.right = 'initial';
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'right-bottom':
                    alert.style.right = 'initial';
                    alert.style.bottom = 'initial';
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'bottom':
                    alert.style.bottom = 'initial';
                    if (moveX > alert.offsetWidth / 2 && moveX < maxX + alert.offsetWidth / 2) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
            }


        },

      
        fnBindEvents(ctx) {
            const { alert, close, content, okTips, confirm, cancel } = ctx.el;   // es6
            
            if (confirm) {
                confirm.onclick = function (e) {
                    e.preventDefault();
                    if (ctx.options.onEvents && typeof ctx.options.onEvents === 'function') {
                        ctx.options.onEvents({ ctx: ctx, confirm: true });
                    } else {
                        ctx.close();
                    }
                };
            }
            
            if (cancel) {
                cancel.onclick = function (e) {
                    e.preventDefault();
                    if (ctx.options.onEvents && typeof ctx.options.onEvents === 'function') {
                        ctx.options.onEvents({ ctx: ctx, cancel: true });
                    } else {
                        ctx.close();
                    }
                };
            }
            if (ctx.options.copy.use) {
                
                const doCopy = function () {
                    const copyContent = ctx.options.copy.onlyText ? content.innerText : content.innerHTML;
                    navigator.clipboard.writeText(copyContent);
                    if (ctx.options.copy.useTips) {
                        okTips.innerText = '提示：内容复制成功，使用 [ ctrl + v ] 快捷键即可快速粘贴！';
                        clearTimeout(Timeout.okTips);
                        Timeout.okTips = setTimeout(function () {
                            okTips.innerText = '';
                        }, 3000)
                    }
                };

                if (ctx.options.copy.isDbClick) {
                    content.onclick = null;
                    content.ondblclick = function (e) {
                        e.preventDefault();
                        doCopy();
                    };
                } else {
                    content.ondblclick = null;
                    content.onclick = function (e) {
                        e.preventDefault();
                        doCopy();
                    };
                }
            } else {
                ctx.options.isDbClick && (content.ondblclick = null);
                !ctx.options.isDbClick && (content.onclick = null);
            }
           
            close.onclick = function (e) {
                e.preventDefault();
                ctx.close();
            };
            
            if (ctx.options.useDrop) {
                this.fnOnDrop(ctx);
            }
            
            document.onkeydown = function (e) {
                if (e.key === 'Escape' && ctx.options.useEscClose) {
                    ctx.close();
                }
            }
        },
        
        fnRemoveEvents(ctx) {
            const { alert, close, content, okTips, confirm, cancel, mask } = ctx.el;   // es6
            confirm && (confirm.onclick = null);
            cancel && (cancel.onclick = null);
            close && (close.onclick = null);
            content && (content.onclick = null);
            content && (content.ondblclick = null);
            mask && (mask.onclick = null);
        },

    
        fnLockOrUnLockScroll(isLock = true) {
            if (isLock) {
                document.getElementsByTagName('body')[0].style.overflow = "hidden";
            } else {
                document.getElementsByTagName('body')[0].style.overflow = "visible";
            }
        }
    };

    const TzAlert = function (options) {
        if (!(this instanceof TzAlert)) { return new TzAlert(options); }
        this.options = Utils.fnDeepMerge({
            id: '',    
            position: 'top', 
            gap: 15,         
            animate: '',    
            animateSpeed: 'slow',   
            width: '400px', 
            top: '20px',    
            radius: '6px',  
            shadow: '0 2px 10px rgba(0,0,0,0.2)', 
            async: false,   
            asyncTime: 1000,
            center: false,  
            useDrop: true,  
            useMaskClose: true,  
            useInitShow: false,  
            useEscClose: false,  
            useLockScroll: false, 
            copy: {
                use: false,
                onlyText: true,    
                useTips: true,
                isDbClick: true 
            },
            confirm: {
                use: true,
                text: '确认',
                textColor: '#fff',
                bgColor: 'rgb(16 16 16)',
                radius: '6px',
                border: '1px solid #aa80ab',
                shadow: '0px 1px 10px rgb(16 16 16)',
                padding: '6px 15px',
            },
            cancel: {
                use: true,
                text: '取消',
                textColor: '#333',
                bgColor: '#fff',
                border: '1px solid #dcdfe6',
                radius: '6px',
                shadow: '0px 1px 3px rgba(144, 147, 153, .2)',
                padding: '6px 15px',
            },
            mask: {
                use: true,
                background: 'rgba(0,0,0,.3)'
            },
            title: {
                html: '',
                color: '',
                fontSize: '',
                fontWeight: '',
            },
            content: {
                html: '',
                padding: ''
            },
            tips: {
                html: '',
                color: '',
                fontSize: '',
                fontWeight: '',
            },
            bottom: {
                isCover: false, 
                show: true,
                html: '',
            },
            onClose: null,
            onEvents: null,
            onMounted: function () { }
        }, options);

        this.init();
    };

    TzAlert.prototype = {
        status: {
            show: false 
        },
        el: {
            mask: null,
            alert: null,
            title: null,
            close: null,
            content: null,
            tips: null,
            okTips: null,
            bottom: null,
            confirm: null,
            cancel: null,
        },
        
        fnGetDomElements() {
            this.el.mask = document.getElementById(`AlertMask${RandomHelper.renderIdKey}`);
            this.el.alert = document.getElementById(`Alert${RandomHelper.renderIdKey}`);
            this.el.title = document.getElementById(`AlertTitle${RandomHelper.renderIdKey}`);
            this.el.close = document.getElementById(`AlertClose${RandomHelper.renderIdKey}`);
            this.el.content = document.getElementById(`AlertContent${RandomHelper.renderIdKey}`);
            this.el.tips = document.getElementById(`AlertTips${RandomHelper.renderIdKey}`);
            this.el.okTips = document.getElementById(`AlertOkTips${RandomHelper.renderIdKey}`);
            this.el.bottom = document.getElementById(`AlertBottom${RandomHelper.renderIdKey}`);
            this.el.confirm = document.getElementById(`AlertConfirm${RandomHelper.renderIdKey}`);
            this.el.cancel = document.getElementById(`AlertCancel${RandomHelper.renderIdKey}`);
        },
        
        open(options, isInit = false) {
            const _this = this; 
            const doOpen = function () {
                
                EventHandler.fnLockOrUnLockScroll(_this.options.useLockScroll);

                const alert = _this.el.alert;
                let _animateSpeed = _this.options.animateSpeed == 'fast' ? ' alert-ani-fast ' : ' alert-ani-slow '; // 暂时支持快和慢
                let _animate = _this.options.animate ? ` alert-ani-show-${_this.options.animate}-${_this.options.position} ` : '';
                alert.classList = `alert-wrap is-visible ${_animate} ${_animateSpeed}`;
                _this.status.show = true;
            };
            if (options) {
                _this.options = Utils.fnDeepMerge(_this.options, options, ['']);
                _this.options.onEvents = options.onEvents || null;
                if (!_this.options.mask.use && _this.status.show) {
                    _this.close();
                } else {
                    HtmlHelper.diffRenderHtml(_this);
                    doOpen();
                }
            } else {
                if (_this.options.mask.use) {
                    HtmlHelper.fnCreateMask(_this);
                }
                if (!isInit) {
                     
                    _this.options = Utils.fnDeepClone(CacheManager[CacheManagerKeys.OldOptions + RandomHelper.renderIdKey]);
                    HtmlHelper.diffRenderHtml(_this);
                }
                doOpen();
            }
        },
        
        close() {
            clearTimeout(Timeout.close);
            clearTimeout(Timeout.okTips);

            const _this = this;
            const alert = _this.el.alert,
                okTips = _this.el.okTips,
                mask = _this.el.mask;
            okTips.innerText = '';

            const doCloseAndCallback = function () {
                EventHandler.fnLockOrUnLockScroll(false); 
                alert.classList = 'alert-wrap no-visible';
                _this.status.show = false;
                if (mask) {
                    mask.style.display = 'none';
                }
                if (_this.options.onClose && typeof _this.options.onClose === 'function') {
                    _this.options.onClose();
                }
            };

            if (_this.options.async) {
                Timeout.close = setTimeout(function () {
                    doCloseAndCallback();
                }, _this.options.asyncTime);
            } else {
                doCloseAndCallback();
            }
        },
        
        init() {
            const _this = this;

            
            if (_this.options.id == '' || _this.options.id == null || _this.options.id == undefined) {
                RandomHelper.fnGenerateRandomId();
            } else {
                RandomHelper.fnSetUserCustomId(_this.options.id);
            }
            
            CacheManager[CacheManagerKeys.OldOptions + RandomHelper.renderIdKey] = Utils.fnDeepClone(_this.options);  // 使用缓存管理

            
            let showTitle = _this.options.title.html != '';
            let showContent = _this.options.content.html != '';
            let showTips = _this.options.tips.html != '';
            let showBottom = _this.options.bottom.html != '';
            if (!showBottom) {
                showBottom = _this.options.confirm.use || _this.options.cancel.use;
            }

            
            let allStyles = HtmlHelper.fnGetStyles(_this);
            const alertStyle = allStyles.alertStyle,
                titleStyle = allStyles.titleStyle,
                contentStyle = allStyles.contentStyle,
                tipsStyle = allStyles.tipsStyle,
                okTipsStyle = allStyles.okTipsStyle,
                bottomStyle = allStyles.bottomStyle,
                confirmStyle = allStyles.confirmStyle,
                cancelStyle = allStyles.cancelStyle;

            
            _this.options.useInitShow && HtmlHelper.fnCreateMask(_this);

            
            const $body = document.getElementsByTagName('body')[0];
            const elAlert = document.createElement('div');
            elAlert.className = 'alert-wrap  no-visible';
            elAlert.setAttribute('id', `Alert${RandomHelper.renderIdKey}`);
            elAlert.style = alertStyle;

            let _bottomHtml, alertConfirmBtn, alertCancelBtn;
            if (_this.options.confirm.use) {
                alertConfirmBtn = HtmlHelper.buttonHtml('confirm', confirmStyle, _this.options.confirm.text);
            }
            if (_this.options.cancel.use) {
                alertCancelBtn = HtmlHelper.buttonHtml('cancel', cancelStyle, _this.options.cancel.text);
            }
            if (_this.options.bottom.html && _this.options.bottom.show) {
                if (_this.options.bottom.isCover) {
                    _bottomHtml = _this.options.bottom.html;
                } else {
                    _bottomHtml = _this.options.bottom.html + alertCancelBtn + alertConfirmBtn;
                }
            } else {
                _bottomHtml = alertCancelBtn + alertConfirmBtn;
            }
            elAlert.innerHTML = `
                <span class="alert-close" id="AlertClose${RandomHelper.renderIdKey}" title="关闭">+</span>
                <h5 class="alert-title ${showTitle ? 'el-is-show-flex' : 'el-is-hide'}" style="${titleStyle}" id="AlertTitle${RandomHelper.renderIdKey}">${_this.options.title.html}</h5>
                <div class="alert-content ${showContent ? 'el-is-show-flex' : 'el-is-hide'}" style="${contentStyle}"  id="AlertContent${RandomHelper.renderIdKey}">${_this.options.content.html}</div>
                <div class="alert-tips ${showTips ? 'el-is-show-flex' : 'el-is-hide'}" style="${tipsStyle}" id="AlertTips${RandomHelper.renderIdKey}">${_this.options.tips.html}</div>
                <div class="alert-copy-ok-tips" id="AlertOkTips${RandomHelper.renderIdKey}" style="${okTipsStyle}" ></div>
                <div class="alert-bottom ${showBottom ? 'el-is-show-flex' : 'el-is-hide'}" style="${bottomStyle}" id="AlertBottom${RandomHelper.renderIdKey}">${_bottomHtml}</div>
            `;

            $body.appendChild(elAlert);

            
            _this.fnGetDomElements();
            
            EventHandler.fnBindEvents(_this);

            
            if (_this.options.useInitShow) {
                _this.open(null, true);
            }
           
            if (_this.options.onMounted && typeof _this.options.onMounted === 'function') {
                setTimeout(function () { _this.options.onMounted(); }, 0);
            }
        }
    };

    window.TzAlert = TzAlert;
}());