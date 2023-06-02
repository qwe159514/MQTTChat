var client;
var mqttId = "";
var mqttChatName = "Ericzhan";

$(function () {
    MqttClientConnect(true);
});

function MqttClientConnect(isInit) {
    if (isInit) {
        mqttId = "id_" + (new Date().getTime());

        client = new Paho.MQTT.Client(mqttHost, Number(mqttPort), mqttId);
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;
    }
    client.connect({
        userName: mqttUserName,
        password: mqttPassword,
        onSuccess: onConnect,
        useSSL: mqttUseSSL
    });
};

function onConnect() {
    console.log("mqtt onConnect");
    client.subscribe(mqttTopic_Chat);
};

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0)
        console.log("onConnectionLost:" + responseObject.errorMessage);
    MqttClientConnect(false);
};

function onMessageArrived(message) {
    let payloadString = message.payloadString;

    let userMessage = payloadString.substring(payloadString.indexOf(':')+1 ,payloadString.length);
    let userName = payloadString.substring(0,payloadString.indexOf(':'));

    isImageLinkValid(userMessage)
    .then(result=>{
        if(result){
            $("#divChatInfo").prepend(`${userName}:<img src="${userMessage}" style="max-width:200px;"/> <br/>`);
        }
        else{
            $("#divChatInfo").prepend(payloadString + "<br/>");
        }
    });
};


function isImageLinkValid(link) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(true);
    };

    image.onerror = () => {
      resolve(false);
    };

    image.src = link;
  });
}

function sendMessage(messageStr) {
    //let sendMsg = `${mqttChatName}(${mqttId}):${messageStr}`;
    let sendMsg = `${mqttChatName}:${messageStr}`;
    let message = new Paho.MQTT.Message(sendMsg);
    message.destinationName = mqttTopic_Chat;
    client.send(message);
};

function btnSend_Click() {
    mqttChatName = $("#txtMyName").val();

    if ($("#txtMyMsg").val()) {
        sendMessage($("#txtMyMsg").val());
        $("#txtMyMsg").val('');
    }
};