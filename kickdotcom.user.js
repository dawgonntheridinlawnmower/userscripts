// ==UserScript==
// @name         UGH Kick
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Make Twitch play Kick's livestream.
// @author       Someone
// @match        *://twitch.tv/xqc
// @match        *://*.twitch.tv/xqc
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @updateURL    https://github.com/dawgonntheridinlawnmower/userscripts/raw/main/kickdotcom.user.js
// @downloadURL  https://github.com/dawgonntheridinlawnmower/userscripts/raw/main/kickdotcom.user.js
// ==/UserScript==

(function () {
    'use strict';

    // xqcL https://github.com/pixeltris/TwitchAdSolutions/blob/master/video-swap-new/video-swap-new.user.js
    function findReactNode(root, constraint) {
        if (root.stateNode && constraint(root.stateNode)) {
            return root.stateNode;
        }
        var node = root.child;
        while (node) {
            const result = findReactNode(node, constraint);
            if (result) {
                return result;
            }
            node = node.sibling;
        }
        return null;
    }


    async function loadPlayer() {
        var reactRootNode = null;
        var rootNode = document.querySelector('#root');
        if (rootNode && rootNode._reactRootContainer && rootNode._reactRootContainer._internalRoot && rootNode._reactRootContainer._internalRoot.current) {
            reactRootNode = rootNode._reactRootContainer._internalRoot.current;
        }
        if (!reactRootNode) {
            console.log('Could not find react root');
            return;
        }

        var player = findReactNode(reactRootNode, node => node.setPlayerActive && node.props && node.props.mediaPlayerInstance);

        player = player && player.props && player.props.mediaPlayerInstance ? player.props.mediaPlayerInstance : null;

        if (!player) {
            console.log('Could not find player');
            return;
        }

        fetch("https://kick.com/api/v2/channels/xqc").then(res => res.json()).then(({ playback_url }) => {
            player.load("https://corsproxy.io/?" + playback_url)
            player.play()
        }).catch(console.error)

    }

    async function init(attempts) {
        if (document.getElementById('load-kick')) return
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const navMenu = document.querySelector(".top-nav__menu")?.lastChild
        if (!navMenu && attempts < 10) {
            setTimeout(init, 1000);
            return
        }

        const btn = document.createElement("button")
        btn.classList.add('load-kick');
        btn.innerHTML = `<svg height="20" viewBox="0 -8 85 33">
<path d="M0 0H8.26393V5.71333H11.0186V2.85667H13.7732V0H22.0371V8.57H19.2825V11.4267H16.5279V14.2833H19.2825V17.14H22.0371V25.71H13.7732V22.8533H11.0186V19.9967H8.26393V25.71H0V0ZM55.0929 0H63.3568V5.71333H66.1114V2.85667H68.8661V0H77.13V8.57H74.3754V11.4267H71.6207V14.2833H74.3754V17.14H77.13V25.71H68.8661V22.8533H66.1114V19.9967H63.3568V25.71H55.0929V0ZM24.7918 0H33.0557V25.71H24.7918V0ZM44.0743 0H38.565V2.85667H35.8104V22.8533H38.565V25.71H44.0743H52.3382V17.14H44.0743V8.57H52.3382V0H44.0743Z"
fill="white"></path>
</svg>`;
        btn.title = 'Load Kick';
        btn.display = 'block'
        btn.onclick = loadPlayer;
        navMenu.insertBefore(btn, navMenu.firstChild)
    }

    if (["complete", "interactive", "loaded"].includes(document.readyState)) {
        return init();
    }
    window.addEventListener("DOMContentLoaded", () => {
        init()
    });

})();
