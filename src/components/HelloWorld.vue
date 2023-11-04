<template>
  <div class="hello">
    <h1>{{ connectionText }}</h1>
    <input id="channel-id" type="text" v-model="channelId" />
    <button @click="startCall" id="call-button">Call Channel</button>
  </div>
</template>

<script>
import { Peer } from 'peerjs'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      channelId: null,
      peer: null,
      localStream: null,
      localAudio: null,
      remoteAudio: null,
      remoteStream: null,
      connectionText: 'Not connected. Start a call!',
      connection: null
    }
  },
  created() {
    this.peer = new Peer()
    this.peer.on("open", () => {
      this.connectionText = `Your device ID is: ${this.peer.id}`;
    });
    this.peer.on('connection', (connection) => {
      this.connection = connection
    
    })
    this.peer.on("call", (call) => {
      const answerCall = confirm("Do you want to answer?");
      if (answerCall) {
        this.getLocalStream()
        call.answer(this.localStream); // A
        call.on("stream", (stream) => {
          // C
          this.remoteAudio.srcObject = stream;
          this.remoteAudio.autoplay = true;
          this.remoteStream = stream;
        });
      } else {
        console.log("call denied"); // D
      }
    });
  },
  mounted () {
    this.localAudio = new Audio()
    this.remoteAudio = new Audio()
  },
  methods: {
    async startCall() {
      console.log('Starting Call')
      await this.getLocalStream()
      this.connectPeers()
      const call = this.peer.call(this.channelId, this.localStream); // A
      console.log(call)
      call.on("stream", (stream) => {
        // B
        this.remoteAudio.srcObject = stream; // C
        this.remoteAudio.autoplay = true; // D
        this.remoteStream = stream; //E
      });

    },
    connectPeers() {
      this.peer.connect(this.channelId)
    },
    async getLocalStream() {
      try {
        const stream = await navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
      
        this.localStream = stream; // A
        this.localAudio.srcObject = stream; // B
        this.localAudio.autoplay = true; // C
        this.localAudio.muted = true
        }
        catch(err){
          console.error(`you got an error: ${err}`);
        }
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
