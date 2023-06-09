import React from 'react';
import { IgnoreCache } from '@app/Caches/IgnoreCache';
import { fireEvent, screen } from '@testing-library/react';
import * as IgnoreCacheHook from '@app/services/cachesHook';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/cachesHook');
const mockedCacheHook = IgnoreCacheHook as jest.Mocked<typeof IgnoreCacheHook>;

let closeModalCalls;
let onHideCalls;
let onUndoCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onHideCalls = 0;
  onUndoCalls = 0;
});

mockedCacheHook.useIgnoreCache.mockImplementation(() => {
  return {
    onIgnore: () => onHideCalls++
  };
});

mockedCacheHook.useUndoIgnoreCache.mockImplementation(() => {
  return {
    onUndoIgnore: () => onUndoCalls++
  };
});

describe('Ignore/Hide cache', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(
      <IgnoreCache
        cmName={'cm-1'}
        cacheName={'cache-1'}
        isModalOpen={false}
        closeModal={() => closeModalCalls++}
        action="ignore"
      />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(onHideCalls).toBe(0);
    expect(onUndoCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(
      <IgnoreCache
        cmName={'cm-1'}
        cacheName={'cache-1'}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
        action="ignore"
      />
    );

    expect(mockedCacheHook.useIgnoreCache).toHaveBeenCalledWith('cm-1', 'cache-1');

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);
    expect(onHideCalls).toBe(0);

    const ignoreButton = screen.getByRole('button', { name: 'Hide' });
    fireEvent.click(ignoreButton);
    expect(onHideCalls).toBe(1);
    expect(onUndoCalls).toBe(0);
  });
});

describe('Undo hide cache', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(
      <IgnoreCache
        cmName={'cm-1'}
        cacheName={'cache-1'}
        isModalOpen={false}
        closeModal={() => closeModalCalls++}
        action="undo"
      />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(onUndoCalls).toBe(0);
    expect(onHideCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(
      <IgnoreCache
        cmName={'cm-1'}
        cacheName={'cache-1'}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
        action="undo"
      />
    );

    expect(mockedCacheHook.useIgnoreCache).toHaveBeenCalledWith('cm-1', 'cache-1');

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);
    expect(onUndoCalls).toBe(0);

    const ignoreButton = screen.getByRole('button', { name: 'Show' });
    fireEvent.click(ignoreButton);
    expect(onUndoCalls).toBe(1);
    expect(onHideCalls).toBe(0);
  });
});
