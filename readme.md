# HTML `video` Scrubber

This repository contains and experimental HTML `video` scrubbar implementation
which instead of placing video frames one by one until the scrubbar runs out of
place slices the video into unit-sizes places and fill the scrubbar with the
finest resolution possible preview.

The quest here is to explore how this looks, how useful or not it is and how
helpful it might potentially be for viewing and editing user scenarios.

## Try it

https://tomashubelbauer.github.io/html-video-scrubber

## To-Do

### Add a WebM version to support Safari which currently lacks VP9 support

### Finalize the seeking filling version and add one for playing, too

Right now the seeking filling is like seeking but with the slice taken at the
left edge instead of in the middle. It needs to be improved and maybe split into
two variants: one which only draws the right side of the frame so it behaves the
same way the seeking method does but gives more of a preview while being
generated and another which draws the frame like the sliding one does, again
just the portion to the right of the cursor, but the cursor pulses left to right
based on the module, so I guess this might redraw already drawn parts to the
left? We'll see, in any case, this will also give more preview while generating.

Ultimately this should be meaningless in case of offline generation (because the
results is served finished anyway so preview while generating is useless), but
it might be worth it for online generation and maybe the generated scrubbars
will look better?
