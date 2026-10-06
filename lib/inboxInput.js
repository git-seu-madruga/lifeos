export function shouldSubmitInbox(event,mobile){return !mobile&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&!event.nativeEvent?.isComposing&&event.keyCode!==229;}
