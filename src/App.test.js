import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Worklist component', () => {
  render(<App />);
  const worklistTitle = screen.getByText(/Worklist/i);
  expect(worklistTitle).toBeInTheDocument();
});
