/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

export class Arguments {

    /* *
     *
     *  Static Functions
     *
     * */

    public static argumentMapper (argv: string): string {

        switch (argv) {
            case '-h':
                return '--help';
            case '-v':
                return '--version';
        }

        return argv;
    }

    /* *
     *
     *  Constructor
     *
     * */

    private constructor() {
    }
}

export default Arguments;
