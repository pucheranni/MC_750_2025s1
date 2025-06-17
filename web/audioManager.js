window.AudioManager = class AudioManager {
    constructor() {
        this.FADE_DURATION = 5000;
        this.VOLUME = 0.7;

        this.track1 = new Howl({
            src: ['/audio/PauloCesarPinheiro_Pesadelo.mp3'],
            volume: 0,
            preload: true,
        });

        this.track2 = new Howl({
            src: ['/audio/MiltonNascimento&ChicoBuarque_OQueSera-AFlorDaPele.mp3'],
            volume: 0,
            preload: true,
        });
        this.currentTrack = null;
        this.fadeTimeout = null;
    }

    start() {
        this.fadeIn(this.track1);
        this.currentTrack = 'track1';
        this.setupEndListener('track1');
    }

    restart() {
      clearTimeout(this.fadeTimeout);

      // Remove all 'end' listeners to prevent surprise crossfades
      this.track1.off('end');
      this.track2.off('end');

      // Stop both tracks immediately
      if (this.track1.playing()) this.track1.stop();
      if (this.track2.playing()) this.track2.stop();

      // Seek both to the beginning
      this.track1.seek(0);
      this.track2.seek(0);

      // Set volumes to zero immediately (just in case)
      this.track1.volume(0);
      this.track2.volume(0);

      // Play and fade in track1 right away
      this.track1.play();
      this.track1.fade(0, this.VOLUME, this.FADE_DURATION);

      this.currentTrack = 'track1';
      this.setupEndListener('track1');
    }

    fadeIn(track) {
      if (!track.playing()){
        track.volume(0);
        track.play();
      }
      track.fade(0, this.VOLUME, this.FADE_DURATION);
    }

    fadeOut(track) {
      track.fade(track.volume(), 0, this.FADE_DURATION);
      setTimeout(() => {
                 track.stop();
                 }, this.FADE_DURATION);
    }

    startCrossfade(fromName, toName) {
      const from = this.getTrack(fromName);
      const to = this.getTrack(toName);

      this.fadeOut(from);
      this.fadeIn(to);

      this.currentTrack = toName;

      this.fadeTimeout = setTimeout(() => {
                                    this.setupEndListener(toName);
                                    }, this.FADE_DURATION);
    }

    setupEndListener(trackName) {
        const track = this.getTrack(trackName);
        track.once('end', () => {
            const nextTrack = trackName === 'track1' ? 'track2' : 'track1';
            this.startCrossfade(trackName, nextTrack);
        });
    }

    getTrack(name) {
        return name === 'track1' ? this.track1 : this.track2;
    }

    destroy() {
        clearTimeout(this.fadeTimeout);
        this.track1.unload();
        this.track2.unload();
    }
};
