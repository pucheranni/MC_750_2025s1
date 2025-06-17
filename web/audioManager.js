window.AudioManager = class AudioManager {
    constructor() {
        this.FADE_DURATION = 2000;
        this.VOLUME = 0.7;

        this.track1 = new Howl({
            src: ['/audio/PauloCesarPinheiro_Pesadelo.mp3'],
            volume: 0,
        });

        this.track2 = new Howl({
            src: ['/audio/MiltonNascimento&ChicoBuarque_OQueSera-AFlorDaPele.mp3'],
            volume: 0,
        });

        this.currentTrack = 'track1';
        this.fadeTimeout = null;
    }

    start() {
        this.fadeIn(this.track1);
        this.currentTrack = 'track1';
        this.setupEndListener('track1');
    }

    restart() {
        clearTimeout(this.fadeTimeout);
        this.track1.fade(this.track1.volume(), 0, this.FADE_DURATION);
        this.track2.fade(this.track2.volume(), 0, this.FADE_DURATION);

        setTimeout(() => {
            this.track1.stop();
            this.track2.stop();

            this.track1.seek(0);
            this.track2.seek(0);

            this.fadeIn(this.track1);
            this.currentTrack = 'track1';
            this.setupEndListener('track1');
        }, this.FADE_DURATION);
    }

    fadeIn(track) {
        track.volume(0);
        track.play();
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
