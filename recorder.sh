#! /bin/sh

mkdir -p /media/tim/Other\ Drive/camera${1}

ffmpeg -rtsp_transport tcp -i rtsp://admin:Milly%20Lola%20810@192.168.1.20${1}:554/Streaming/Channels/101 -f segment -strftime 1 \
    -segment_time 00:01:00 -segment_atclocktime 1 -segment_clocktime_offset 30 \
    -segment_format mp4 -an -vcodec copy -reset_timestamps 1 \
    /media/tim/Other\ Drive/camera${1}/record_%Y-%m-%d-%H.%M.%S.mp4 >/media/tim/Other\ Drive/camera${1}/output.log 2>&1 </dev/null &
    
