import { setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';

let transition: Promise<void> = Promise.resolve();

function queue(task: () => Promise<void>) {
  const next = transition.catch(() => undefined).then(task);
  transition = next.catch(() => undefined);
  return next;
}

export function preparePlaybackAudio() {
  return queue(async () => {
    try {
      await setIsAudioActiveAsync(false);
    } catch {}

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 120);
    });

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers'
    });

    await setIsAudioActiveAsync(true);
  });
}

export function prepareRecordingAudio() {
  return queue(async () => {
    try {
      await setIsAudioActiveAsync(false);
    } catch {}

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 120);
    });

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix'
    });

    await setIsAudioActiveAsync(true);
  });
}

export function releaseAudioSession() {
  return queue(async () => {
    try {
      await setIsAudioActiveAsync(false);
    } catch {}

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers'
    });
  });
}

export function recoverPlaybackAudio() {
  return queue(async () => {
    try {
      await setIsAudioActiveAsync(false);
    } catch {}

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 220);
    });

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers'
    });

    await setIsAudioActiveAsync(true);
  });
}
