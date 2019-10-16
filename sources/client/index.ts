/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

/**
 * Namespace in the web browser on the client side.
 */
namespace HighsoftWebSearch {
    export function connect (
        basePath: string,
        inputElement: (string|HTMLInputElement),
        buttonElement: (string|HTMLElement),
        outputElement: (string|HTMLElement)
    ): Controller {

        if (typeof inputElement === 'string') {
            inputElement = ((document.getElementById(inputElement) as HTMLInputElement) || '');
        }

        if (!(inputElement instanceof HTMLInputElement)) {
            throw new Error('Input element not found.');
        }

        if (typeof outputElement === 'string') {
            outputElement = (document.getElementById(outputElement) || '');
        }

        if (!(outputElement instanceof HTMLElement)) {
            throw new Error('Output element not found.');
        }

        if (typeof buttonElement === 'string') {
            buttonElement = (document.getElementById(buttonElement) || '');
        }

        if (!(buttonElement instanceof HTMLElement)) {
            throw new Error('Button element not found.');
        }

        return new Controller(
            new Search(basePath),
            inputElement,
            outputElement,
            buttonElement
        );
    }
}
