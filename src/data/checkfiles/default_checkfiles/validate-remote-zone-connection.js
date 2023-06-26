import React from 'react'
import { Link } from "@reach/router";

export default {
    name: "Validate Remote Zone Connection",
    description: "Checks if each passthru resource has exactly one child.",
    minimum_server_version: "4.2.0",
    maximum_server_version: "",
    interval_in_seconds: 86400,
    active: true,
    checker: function () {
        let result = {
            status: '',
            message: '',
            success: 0,
            failed: []
        }

        let connection = new WebSocket("ws://localhost:1247");
        connection.onopen = function () {
            connection.send('3<MsgHeader_PI><type>HEARTBEAT</type></MsgHeader_PI>'); // Send the message 'Ping' to the server 3<MsgHeader_PI><type>HEARTBEAT</type></MsgHeader_PI>
            console.log("sent message...");

        };          

        connection.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
          });
          
    }
}
