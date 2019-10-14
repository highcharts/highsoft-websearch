/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

/**
 * Namespace in the web browser on the client side.
 */
namespace HighsoftSearch {
    export function connect (basePath: string, inputElementID: string, outputElementID: string, buttonElementID: string): Search {

        const inputElement = document.getElementById(inputElementID);

        if (!(inputElement instanceof HTMLInputElement)) {
            throw new Error('Input element not found.');
        }

        const outputElement = document.getElementById(outputElementID);

        if (!(outputElement instanceof HTMLElement)) {
            throw new Error('Output element not found.');
        }

        const buttonElement = document.getElementById(buttonElementID);

        if (!(buttonElement instanceof HTMLElement)) {
            throw new Error('Button element not found.');
        }

        return new Search(basePath, inputElement, outputElement, buttonElement);
    }
}
