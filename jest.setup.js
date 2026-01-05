import '@testing-library/jest-dom/extend-expect';

// Allow router mocks.
// eslint-disable-next-line no-undef
jest.mock('next/router', () => require('next-router-mock'));

// Prefer the new React-provided act to avoid deprecated react-dom/test-utils warnings when running tests.
jest.mock('react-dom/test-utils', () => {
	const actual = jest.requireActual('react-dom/test-utils');
	const react = jest.requireActual('react');
	return {
		...actual,
		act: react.act ?? actual.act,
	};
});

// Silence the specific deprecation warning while upstream libraries transition to the new act import.
const originalConsoleError = console.error;
let consoleErrorSpy;

beforeAll(() => {
	consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
		const [firstArg] = args;
		if (
			typeof firstArg === 'string' &&
			firstArg.includes('ReactDOMTestUtils.act') &&
			firstArg.includes('deprecated')
		) {
			return;
		}

		originalConsoleError(...args);
	});
});

afterAll(() => {
	consoleErrorSpy?.mockRestore();
});
