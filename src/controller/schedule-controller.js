const userSchema = require('../model/user-model');
const home = require('../model/home-model');
const Podcast = require('../model/podcast-model');
const Chatroom = require('../model/chat-room-model');
const cron = require('node-cron');
const { uploadPodcast } = require('./podcast-controller');

cron.schedule('*/2 * * * *', async () => {
  console.log('cron is scheduled at', Date());
 
  const podcasts = await Podcast.schedulePodcastSchema.find({
    schedule_time: { $lte: new Date() },
  });
  if (podcasts.length != 0) {
    for (const podcast of podcasts) {
        const id = await uploadPodcast(podcast);
        if(id){
          const scheduleDone = await Podcast.schedulePodcastSchema.findByIdAndDelete(id);
          if(scheduleDone){
            console.log("Scheduled Podcast Uploaded Sucessfully with Id :",id);
          }
        }
    }
  }
});

module.exports;
