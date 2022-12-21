export const SPLITBEE_TOKEN = process.env.NEXT_PUBLIC_SPLITBEE_TOKEN

// https://splitbee.io/docs/javascript-library

export const track = (event: string, data?: any) => {
  console.log('bee track', { event, data })
  if (window && typeof (window as any).splitbee === `object`) {
    ;(window as any).splitbee.track(event, data)
  }
}
