<template>
  <div class="hello">
    <h1>{{ connectionText }}</h1>
    <input id="channel-id" type="text" v-model="channelId" />
    <div class="buttons">
      <button @click="startCall" id="call-button">Call Channel</button>
      <button @click="sendLocation" id="location-button">Send Location</button>
    </div>

    <p id="status"></p>
    <a id="map-link" target="_blank"></a>
    <div id="map"  height="600px" width="400px"></div>
  </div>
</template>

<script>
import { Peer } from 'peerjs'
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM.js';
import {useGeographic} from 'ol/proj'
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
      connection: null,
      map: {}
    }
  },
  created() {
    this.peer = new Peer()
    this.peer.on("open", () => {
      this.connectionText = `Your device ID is: ${this.peer.id}`;
    });
    this.peer.on('connection', (connection) => {
      console.log(connection)
      this.connection = connection
      this.connection.on('data', (data) => {
        
        const status = document.querySelector("#status");
        const mapLink = document.querySelector("#map-link");
        const latitude = data.latitude;
        const longitude = data.longitude;
        useGeographic()
        console.log(data)
        const map = new Map({
          target: 'map',
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
          ],
          view: new View({
            center: [latitude, longitude],
            zoom: 2
          })
        });
        console.log(map)
        status.textContent = "";
        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
      })
    
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
    sendLocation(){
      const status = document.querySelector("#status");
      if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser";
      } else {
        status.textContent = "Locating…";
        navigator.geolocation.getCurrentPosition(this.success, this.error, {maximumAge:60000, timeout:5000, enableHighAccuracy:true});
      }
    },
    success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      this.connection.send({latitude: latitude, longitude: longitude})
    },
    async startCall() {
      console.log('Starting Call')
      await this.getLocalStream()
      this.connectPeers()
      const call = this.peer.call(this.channelId, this.localStream); // A
      
      call.on("stream", (stream) => {
        // B
        this.remoteAudio.srcObject = stream; // C
        this.remoteAudio.autoplay = true; // D
        this.remoteStream = stream; //E
      });

    },
    connectPeers() {
      this.connection = this.peer.connect(this.channelId)
      this.connection.on('data', (data) => {
        console.log(data)
        const status = document.querySelector("#status");
        const mapLink = document.querySelector("#map-link");
        const latitude = data.latitude;
        const longitude = data.longitude;
        useGeographic()
        
        const map = new Map({
          target: 'map',
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
          ],
          view: new View({
            center: [latitude, longitude],
            zoom: 2
          })
        });
        console.log(map)
        status.textContent = "";
        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
      })
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

html,
body {
  margin: 0;
  height: 100%;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
