// handling channel related operations
function ChannelManager(app) {
    this.app = app;

    this._prepareChannelView = function(channelId, view) {
        this.app.messageManager.resetAppState();
        this.app.state.currentChannelId = channelId;
        this.app.state.currentView = view;

        this.app.uiManager.elements.messageInput.disabled = false;
        this.app.uiManager.elements.sendButton.disabled = false;
        this.app.uiManager.showChatPopup();

        this.app.messageManager.fetchMessages();
        this.app.messageManager.startMessageRefresh();
    };

    // load the channel (duh)
    this.loadChannel = function (serverId, channelId, channelName) {
        this._prepareChannelView(channelId, 'server');
        this.app.state.currentServerId = serverId;

        window.location.hash = "#guild-" + serverId + "/" + channelId;

        this.app.uiManager.elements.chatTitle.innerHTML = twemoji.parse("#" + channelName);
    };

    // load DM (duh)
    this.loadDM = function (dmChannelId, userId, username) {
        this._prepareChannelView(dmChannelId, 'dm');
        this.app.state.currentDmUserId = userId;

        window.location.hash = "#dm-" + userId;

        this.app.uiManager.elements.chatTitle.textContent = "DM: " + username;

        this.app.apiService.fetch("https://discord.com/api/v9/channels/" + dmChannelId + "/messages?limit=1")
            .then(function (res) {
                if (!res.ok) return;
                return res.json();
            })
            .then(function (messages) {
                if (messages && messages.length > 0) {
                    this.app.state.lastSeenMessageIds[dmChannelId] = messages[0].id;
                }
            }.bind(this))
            .catch(function (error) {
                console.error("Error updating last seen message:", error);
            });
    };

    // load the channel from hash
    this.loadChannelFromHash = function (serverId, channelId) {
        this.app.apiService.fetch("https://discord.com/api/v9/channels/" + channelId)
            .then(function (res) {
                if (!res.ok) throw new Error("Failed to fetch channel info");
                return res.json();
            })
            .then(function (channel) {
                this.loadChannel(serverId, channelId, channel.name);
            }.bind(this))
            .catch(function (error) {
                console.error("Error loading channel from hash:", error);
            });
    };

    // load the dm from hash
    this.loadDmFromHash = function (userId) {
        this.app.apiService.fetch("https://discord.com/api/v9/users/@me/channels")
            .then(function (res) {
                if (!res.ok) throw new Error("Failed to fetch DMs");
                return res.json();
            })
            .then(function (dms) {
                var dm = dms.find(function(dmChannel) {
                    return dmChannel.recipients && 
                           dmChannel.recipients.length > 0 && 
                           dmChannel.recipients[0].id === userId;
                });

                if (dm) {
                    this.loadDM(dm.id, userId, dm.recipients[0].username);
                }
            }.bind(this))
            .catch(function (error) {
                console.error("Error loading DM from hash:", error);
            });
    };
}