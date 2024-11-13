'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useCreateAttendance } from '@/hooks/attendance/use-create-attendance';
import { kyInstance } from '@/lib/ky';
import { Components, GeocodeResponse } from '@/types';
import { useUpdateAttendance } from '@/hooks/attendance/use-update-attendance';
import { Attendance } from '@/database/schema';

interface ResolvedData {
  components: Components;
  formatted: string;
}

interface ICapturePhoto {
  attendanceId?: string;
  initialValues?: Attendance;
}

export const CapturePhoto = ({
  attendanceId,
  initialValues,
}: ICapturePhoto) => {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // const [action, setAction] = useState<'check-in' | 'check-out'>('check-in');
  const [isCapturing, setIsCapturing] = useState(false);
  const [photo, setPhoto] = useState('');
  const [file, setFile] = useState<File>();

  const router = useRouter();
  const { mutate: newAttendance, isPending: isAddingAttendance } =
    useCreateAttendance();
  const { mutate: updateAttendance, isPending: isUpdatingAttendance } =
    useUpdateAttendance();

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
      toast.error('Can not access camera');
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

  const fetchLocation = async () => {
    return new Promise<ResolvedData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const response = await kyInstance
          .get(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
              `${position.coords.latitude},${position.coords.longitude}`
            )}&language=en&pretty=1&key=${process.env
              .NEXT_PUBLIC_OPENCAGE_API_KEY!}`
          )
          .json<GeocodeResponse>();

        if (response?.results.length > 0) {
          const { components, formatted } = response.results[0];
          resolve({ components, formatted });
        } else {
          resolve(null);
        }
      });
    });
  };

  const capturePhoto = async () => {
    if (isCapturing) return; // Prevent double clicks
    setIsCapturing(true);

    const location = await fetchLocation();

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

        const dateText = `${format(new Date(), 'PPP kk:mm:ss')}`;
        const textLines = [
          location?.formatted,
          dateText,
          location?.components.city,
          location?.components.region,
        ];

        // Font settings
        context.font = '16px Arial';
        context.fillStyle = 'white'; // Text color
        context.textAlign = 'right';

        // Bottom-right corner position with padding
        const x = canvas.width - 10;
        let y = canvas.height - 10;

        // Draw each line of text, moving upward for each line
        textLines.forEach((line) => {
          context.fillText(line!, x, y);
          y -= 20; // Adjust line height (20px gap between lines)
        });

        const imageUrl = canvas.toDataURL();
        setPhoto(imageUrl);

        // setTimeout(() => convertBlobUrl(), 0);
        await convertBlobUrl();
        stopCamera();
      }
    }

    setIsCapturing(false);
  };

  const convertBlobUrl = async () => {
    if (photo) {
      const blob = await (await fetch(photo)).blob();
      const newFile = new File([blob], `new_photo-${Date.now()}.png`, {
        type: blob.type,
      });
      setFile(newFile);

      const objectUrl = URL.createObjectURL(newFile);
      setCapturedImage(objectUrl);
    }
  };

  const resetState = () => {
    stopCamera();
    setCapturedImage(null);
  };

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file, file.name);

    const currentHour = new Date().getHours();
    const action =
      currentHour >= 7 && currentHour < 10 ? 'check-in' : 'check-out';

    try {
      if (initialValues) {
        updateAttendance(
          { action, form: formData, params: { attendanceId: attendanceId! } },
          {
            onSuccess: () => {
              router.push('/');
            },
          }
        );
      } else {
        newAttendance(
          { file: formData, action },
          {
            onSuccess(data) {
              console.log(data.message);
              router.push('/');
            },
          }
        );
      }
    } catch (error) {
      console.error('Error uploading file', error);
      toast.error('Error uploading file.');
    }
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
          <div className="flex items-center gap-x-4 absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <Button
              onClick={resetState}
              variant="secondary"
              disabled={isAddingAttendance || isUpdatingAttendance}
            >
              Retake
            </Button>

            <Button
              onClick={uploadFile}
              disabled={isAddingAttendance || isUpdatingAttendance}
            >
              Confirm
            </Button>
          </div>
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
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 border-none rounded-lg py-[10px] px-5 text-[16px] shadow"
            >
              Open Camera
            </Button>
          ) : (
            <Button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 border-none rounded-lg py-[10px] px-5 text-[16px] shadow"
            >
              {isCapturing ? 'Capturing...' : 'Capture Image'}
            </Button>
          )}
        </>
      )}
    </div>
  );
};
