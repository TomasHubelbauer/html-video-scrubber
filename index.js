window.addEventListener('load', async () => {
  if (!location.search) {
    const seekingButton = document.getElementById('seekingButton');
    seekingButton.addEventListener('click', () => location.search = 'seeking');

    const playingButton = document.getElementById('playingButton');
    playingButton.addEventListener('click', () => location.search = 'playing');

    return;
  }

  /** @type {HTMLVideoElement} */
  const playerVideo = document.getElementById('playerVideo');

  const canvasDiv = document.getElementById('canvasDiv');

  // Create the scrubbar canvas and place it below the player video
  const scrubbarCanvas = document.createElement('canvas');
  scrubbarCanvas.width = playerVideo.videoWidth;
  scrubbarCanvas.height = 50;
  canvasDiv.append(scrubbarCanvas);

  const context = scrubbarCanvas.getContext('2d');
  switch (location.search) {
    case '?seeking': {
      await generateBySeeking(playerVideo, context);
      return;
    }
    case '?playing': {
      await generateAsPlaying(playerVideo, context);
      return;
    }
  }

  alert(`Unexpected mode: '${location.search}'.`);
});

/** Seeks the video to times corresponding to each unit of the resolution */
async function generateBySeeking(/** @type {HTMLVideoElement} */ playerVideo, /** @type {CanvasRenderingContext2D} */ context) {
  // TODO: Wait on the metadata/data to load to make sure the values are ready

  let deferred;
  playerVideo.addEventListener('seeked', () => deferred());

  // Seek, wait and capture a frame for each unit of the scrubbar resolution
  for (let index = 0; index < playerVideo.videoWidth; index++) {
    const position = (index / playerVideo.videoWidth) * playerVideo.duration;
    const promise = new Promise(resolve => deferred = resolve);
    playerVideo.currentTime = position;
    await promise;

    // Draw the single unit slice in the middle of the video frame at this time
    context.drawImage(playerVideo, playerVideo.videoWidth / 2, 0, 1, playerVideo.videoHeight, index, 0, 1, 50);
  }
}

/** Observes the video as it plays and for each position change updates scrubbar */
async function generateAsPlaying(/** @type {HTMLVideoElement} */ playerVideo, /** @type {CanvasRenderingContext2D} */ context) {
  await playerVideo.play();

  // Note that this is called between 4 and 66 times a second according to MDN
  playerVideo.addEventListener('timeupdate', () => {
    // Truncate the number to the nearest full unit to avoid blur and mark slot
    const index = ~~((playerVideo.currentTime / playerVideo.duration) * playerVideo.videoWidth);

    // TODO: Keep track of the update frequence and see if the multi-unit size
    // is needed to begin with, this will save on the to-do below which has to
    // do with not overwriting already captured unit slices (but that would
    // still be needed in case of seeking).

    // Note that the above alone would leave gaps and we can help fill them:
    // Assume worst case 4 Hz update frequence, that's once every 250 ms
    // Calculate the duration contained within a single unit (seconds per unit):
    const unit = playerVideo.duration / playerVideo.videoWidth;

    // Calculate how many resolution units the 250 ms frequency would contain:
    const size = Math.ceil(.25 / unit);

    // Draw the size-unit slice in the middle of the video frame at this time
    context.drawImage(playerVideo, playerVideo.videoWidth / 2 - size, 0, size, playerVideo.videoHeight, index - size, 0, size, 50);

    // TODO: Improve by checking previous unit to see if transparent or not and
    // not overwrite if it isn't - do this using `getImageData` for speed, check
    // if all the bytes in the array are #000000ff (probably) and if so, skip
    // the current unit and continue to the next unit in size for each unit of it
  });
}
