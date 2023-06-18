// ==UserScript==
// @name         UGH Kick
// @namespace    http://tampermonkey.net/
// @version      1.0.0
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
        btn.type = "button"
        btn.innerText = "Load Kick"
        btn.id = "load-kick"
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