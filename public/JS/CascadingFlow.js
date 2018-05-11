/*
    Control cascading flow processes
*/

function CascadingHub(name, cbfx, manager) {
    this.name = name;    
    this.centralHub = manager;
    this.event={
        onDataReceived:cbfx?cbfx:function(){}
    }
}

CascadingFlow.prototype.on = function(eventName,fx) {
    fx?this.events[eventName] = fx:0;
}

CascadingHub.prototype.sendData = function (data) {
    this.centralHub.sendData(this, data);
}

CascadingHub.prototype.clearData = function () {
    this.sendData();
}

function CascadingFlow(init) {
    this.hubs = [];
    this.cascadingList = [];
    this.init = init;
    this.events = {
        flowChanged:function(){}
    };
}

CascadingFlow.prototype.createHub = function (name, cbfx) {
    let idx = this.hubs.findIndex(function (hub, name) {
        return hub.name === name;
    })
    if (idx >= 0)
        throw name + " is already registered";

    let h = new CascadingHub(name, cbfx, this);
    this.hubs.push(h)
    return h;
}

CascadingFlow.prototype.sendData = function (hub, data) {
    let idx = this.cascadingList.findIndex(function (e) {
        return hub === e.hub;
    })
    let driverHubIdx = idx;
    let notifiableHubs = []
    let driverHubs = []

    if (idx >= 0) // Exists in cascading list
    {
        driverHubIdx = idx;
        let e = this.cascadingList[idx]
        if (data === undefined) {
            //driverHubs will start from 0 to a hub before this removing hub
            driverHubIdx--;
            //remove this hub from order list
            this.cascadingList.splice(idx, 1);
        }
        else {
            e.data = data;
        }

        //Want to make sure if we remove top element then our driverHubs will 
        //start from 0 to end
        driverHubIdx < 0 ? driverHubIdx = this.cascadingList.length - 1 : driverHubIdx;
    }
    else // Not yet there
    {

        driverHubIdx = -1;
        this.cascadingList.push({ hub, data });
    }

    //Get a list of driverHubs
    //driverHubs are hubs which participating in determining behaviors of notifiableHubs 
    this.cascadingList.every(function (e, i) {
        if (i <= driverHubIdx) {
            driverHubs.push(e.hub)
            return true;
        }
        return false;
    })

    //Find the notifiableHubs
    this.hubs.forEach(function (h) {
        if (!driverHubs.find(function (dh) {
            return dh.hub === h
        })) notifiableHubs.push(h)
    })

    this.__boardcastHub(driverHubs, notifiableHubs)
}

CascadingFlow.prototype.__boardcastHub = function (driverElements, notifiableHubs) {
    ///TODOS
    this.events.flowChanged(driverElements, notifiableHubs)
}

CascadingFlow.prototype.on = function (name, fx) {
    fx?this.events[name] = fx:0
}
