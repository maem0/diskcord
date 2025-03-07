// handling navigation related operations
function NavigationManager(app) {
    this.app = app;

    this.handleHashChange = function() {
        var hash = window.location.hash.substring(1);

        if (hash.startsWith("guild-")) {
            var parts = hash.split("/");
            if (parts.length > 1) {
                var serverId = parts[0].substring(6);
                var channelId = parts[1];
                this.app.channelManager.loadChannelFromHash(serverId, channelId);
            }
        } else if (hash.startsWith("dm-")) {
            var userId = hash.split("-")[1];
            this.app.channelManager.loadDmFromHash(userId);
        }
    };

    this.navigateBack = function() {
        if (this.app.state.currentView === 'server') {
            this.app.uiManager.elements.channelList.style.display = "none";
            this.app.uiManager.elements.serverList.style.display = "block";
            this.app.uiManager.elements.backButton.style.display = "none";
            this.app.uiManager.elements.sidebarTitle.textContent = "Servers";
            this.app.state.currentServerId = null;
            this.app.state.currentView = 'main';
        }

        this.resetChatView();
    };

    this.resetChatView = function() {
        this.app.uiManager.resetChatView();
        this.app.messageManager.resetAppState();
    };
}