import React, { useContext, forwardRef, ReactNode, Ref, useEffect } from 'react';
import { Font, Size } from '@pdfme/common';
import { FontContext } from '../contexts';
import Spinner from './Spinner';

type Props = { size: Size; scale: number; children: ReactNode };

function fontNotStandardFont(
  a: [string, Font[string]]
): a is [
  string,
  Omit<Font[string], 'data'> & { data: Exclude<Font[string]['data'], { standardFont: string }> }
] {
  return !(a[1].data as any).standardFont;
}

const Root = ({ size, scale, children }: Props, ref: Ref<HTMLDivElement>) => {
  const font = useContext(FontContext);

  useEffect(() => {
    if (!document || !document.fonts) return;
    const fontFaces = Object.entries(font)
      .filter(fontNotStandardFont)
      .map(
        ([key, { data }]) =>
          new FontFace(key, typeof data === 'string' ? `url(${data})` : data, {
            display: 'swap',
          })
      );
    // @ts-ignore
    const newFontFaces = fontFaces.filter((fontFace) => !document.fonts.has(fontFace));

    Promise.allSettled(newFontFaces.map((f) => f.load())).then((loadedFontFaces) => {
      loadedFontFaces.forEach((loadedFontFace) => {
        if (loadedFontFace.status === 'fulfilled') {
          // @ts-ignore
          document.fonts.add(loadedFontFace.value);
        }
      });
    });
  }, [font]);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', background: 'rgb(74, 74, 74)', overflow: 'overlay', ...size }}
    >
      <div style={{ margin: '0 auto', ...size }}>{scale === 0 ? <Spinner /> : children}</div>
    </div>
  );
};

export default forwardRef<HTMLDivElement, Props>(Root);
