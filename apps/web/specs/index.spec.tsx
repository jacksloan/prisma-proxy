import React from 'react';
import { render } from '@testing-library/react';

import Index from '../pages/index';

describe('Index', () => {
  it('should render successfully', () => {
    const { baseElement, getByText } = render(
      <Index
        posts={[
          {
            id: 1,
            title: 'Test Post',
            content: 'Blank',
            authorId: 1,
            published: true,
          },
        ]}
      />
    );
    expect(baseElement).toBeTruthy();
    expect(getByText('Test Post')).toBeTruthy();
  });
});
