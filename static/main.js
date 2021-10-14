function test(x, y) {
    console.log("x = " + x + " Y = " + y);
}

Vue.component('alerts-component', VueSimpleNotify.VueSimpleNotify);
var app = new Vue({
    el: '#v-app',
    data: {
        username: '',
        text: '',
        messages: {
            general: [],
            typescript: [],
            '61678d970b03149d4ca9dcdd': []
        },
        socket: { chat: null, alerts: null },
        alerts: [],
        activeRoom: 'general',
        rooms: {
            general: false,
            typescript: false,
            '61678d970b03149d4ca9dcdd': false
        }
    },
    methods: {
        sendChatMessage(x, y) {
            if (this.isMemberOfActiveRoom) {
                this.text = "{ x: " + x + ", y: " + y + "}";
                this.socket.chat.emit('chatToServer', { sender: this.username, room: this.activeRoom, x, y });
                this.text = "";
            } else {
                alert('You must join the room before sending messages!');
            }
        },
        receiveChatMessage(msg) {
            this.messages[msg.room].push(msg);
        },
        receiveAlertMessage(msg) {
            this.alerts.push(msg);
        },
        toggleRoomMembership() {
            if (this.isMemberOfActiveRoom) {
                this.socket.chat.emit('leaveRoom', this.activeRoom);
            } else {
                this.socket.chat.emit('joinRoom', { room: this.activeRoom, player: this.username });
            }
        }
    },
    computed: {
        isMemberOfActiveRoom() {
            return this.rooms[this.activeRoom];
        }
    },
    created() {
        this.username = prompt('Enter your username:');

        this.socket.chat = io('http://localhost:3000/chat');
        this.socket.chat.on('chatToClient', (msg) => {
            this.receiveChatMessage(msg);
        });
        this.socket.chat.on('connect', () => {
            this.toggleRoomMembership();
        });
        this.socket.chat.on('joinedRoom', (room) => {
            this.rooms[room] = true;
        });
        this.socket.chat.on('leftRoom', (room) => {
            this.rooms[room] = false;
        });

        this.socket.alerts = io('http://localhost:3000/alert');
        this.socket.alerts.on('alertToClient', (msg) => {
            this.receiveAlertMessage(msg);
        });
    }
});