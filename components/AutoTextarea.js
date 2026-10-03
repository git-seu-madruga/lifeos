"use client";
import { useLayoutEffect, useRef } from 'react';
export default function AutoTextarea(props) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const element = ref.current;
    const resize = () => { element.style.height = 'auto'; element.style.height = `${element.scrollHeight + 2}px`; };
    resize();
    const observer = new ResizeObserver(() => { if (element.clientWidth !== width) { width = element.clientWidth; resize(); } });
    let width = element.clientWidth;
    observer.observe(element);
    return () => observer.disconnect();
  }, [props.value]);
  return <textarea {...props} ref={ref} style={{ ...props.style, overflow: 'hidden', resize: 'none' }} />;
}
