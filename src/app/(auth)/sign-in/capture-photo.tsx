'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';

export const CapturePhoto = () => {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photo, setPhoto] = useState('');
  const [file, setFile] = useState<Blob | MediaSource>();
  const [currentLocation, setCurrentLocation] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices) {
        let stream = await navigator.mediaDevices.getUserMedia({
          video: {
            aspectRatio: { ideal: 1 },
            width: { max: 1024 },
            height: { max: 1024 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        setMediaStream(stream);
      }
    } catch (error) {
      console.error('Error accessing camera', error);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth && video.videoHeight) {
        // Set canvas dimensions to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Add text overlay
        const dateText = `${format(
          new Date().toLocaleString(),
          'PPP hh:mm:ss'
        )}`;
        context.font = '16px Arial';
        context.fillStyle = 'white'; // Text color
        context.textAlign = 'right';
        context.textBaseline = 'bottom';

        // Position text at bottom-right with padding
        context.fillText(dateText, canvas.width - 10, canvas.height - 10);

        const imageUrl = canvas.toDataURL();
        setPhoto(imageUrl);

        convertBlobUrl();
        stopCamera();

        // TODO: send photo to the server to confirm the user is working
      }
    }
  };

  const convertBlobUrl = async () => {
    if (photo) {
      const blob = await (await fetch(photo)).blob();
      const newFile = new File([blob], `new_photo-${Date.now()}.png`, {
        type: blob.type,
      });
      setFile(newFile); // Set the file state

      const objectUrl = URL.createObjectURL(newFile);
      setCapturedImage(objectUrl); // Use the created object URL

      navigator.geolocation.getCurrentPosition(async (position) => {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            `${(position.coords.latitude, position.coords.longitude)}`
          )}&language=en&pretty=1&key=${process.env.OPENCAGE_API_KEY}`
        );

        const json = await response.json();

        const results = json.results;
        if (results.length > 0) {
          const address = results[0].formatted;
          setCurrentLocation(address);
        }
      });
    }
  };

  const resetState = () => {
    stopCamera();
    setCapturedImage(null);
  };

  return (
    <div className="relative max-w-screen-md my-0 mx-auto w-full">
      {capturedImage ? (
        <>
          <Image
            src={capturedImage}
            alt="w-full rounded-lg md:h-screen md:object-cover md:rounded-none"
            width={100}
            height={100}
            className="w-full"
          />
          <Button
            onClick={resetState}
            variant="secondary"
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2"
          >
            Reset
          </Button>
        </>
      ) : (
        <>
          <video
            className="w-full rounded-lg md:h-screen md:object-cover md:rounded-none aspect-video"
            ref={videoRef}
          />
          <canvas className="hidden" ref={canvasRef} />

          {!videoRef.current ? (
            <Button
              onClick={startCamera}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 border-none rounded-lg py-[10px] px-5 text-[16px] shadow"
            >
              Open Camera
            </Button>
          ) : (
            <Button
              onClick={capturePhoto}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 border-none rounded-lg py-[10px] px-5 text-[16px] shadow"
            >
              Capture Image
            </Button>
          )}
        </>
      )}
    </div>
  );
};
