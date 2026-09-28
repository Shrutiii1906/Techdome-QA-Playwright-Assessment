import { Page } from '@playwright/test';

export type OverflowElement = {
  tag: string;
  id: string;
  className: string;
  text: string;
  left: number;
  right: number;
  width: number;
  scrollWidth: number;
  clientWidth: number;
  overflowX: string;
  position: string;
};

export type OverflowDiagnostics = {
  viewportWidth: number;
  documentWidth: number;
  overflowAmount: number;
  overflowingElements: OverflowElement[];
};

export async function getOverflowDiagnostics(
  page: Page
): Promise<OverflowDiagnostics> {

  return page.evaluate(() => {
    const root = document.documentElement;

    const viewportWidth = root.clientWidth;
    const documentWidth = root.scrollWidth;

    const overflowingElements = [
      ...document.querySelectorAll<HTMLElement>('body *'),
    ]
      .map((element) => {
        const rect =
          element.getBoundingClientRect();

        const style =
          window.getComputedStyle(element);

        return {
          tag: element.tagName,

          id: element.id || '',

          className:
            typeof element.className === 'string'
              ? element.className
              : '',

          text: (element.innerText || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 80),

          left: Math.round(rect.left),

          right: Math.round(rect.right),

          width: Math.round(rect.width),

          scrollWidth:
            element.scrollWidth,

          clientWidth:
            element.clientWidth,

          overflowX:
            style.overflowX,

          position:
            style.position,
        };
      })

      .filter((element) => {
        return (
          element.right > viewportWidth + 1 ||
          element.left < -1
        );
      })

      .sort((a, b) => {
        const overflowA = Math.max(
          a.right - viewportWidth,
          Math.abs(Math.min(a.left, 0))
        );

        const overflowB = Math.max(
          b.right - viewportWidth,
          Math.abs(Math.min(b.left, 0))
        );

        return overflowB - overflowA;
      })

      .slice(0, 20);

    return {
      viewportWidth,
      documentWidth,

      overflowAmount: Math.max(
        0,
        documentWidth - viewportWidth
      ),

      overflowingElements,
    };
  });
}


/**
 * Prints responsive diagnostics in a readable form.
 */
export function logOverflowDiagnostics(
  story: string,
  viewportName: string,
  diagnostics: OverflowDiagnostics
): void {

  console.log(
    `\n===== ${story} | ${viewportName.toUpperCase()} RESPONSIVE CHECK =====`
  );

  console.log(
    `Viewport width: ${diagnostics.viewportWidth}px`
  );

  console.log(
    `Document width: ${diagnostics.documentWidth}px`
  );

  console.log(
    `Horizontal overflow: ${diagnostics.overflowAmount}px`
  );

  if (
    diagnostics.overflowingElements.length > 0
  ) {
    console.log(
      '\nElements extending outside viewport:'
    );

    console.table(
      diagnostics.overflowingElements
    );
  }
}