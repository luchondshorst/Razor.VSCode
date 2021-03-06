/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as fs from 'fs';
import * as razorExtensionPackage from 'microsoft.aspnetcore.razor.vscode';
import { TelemetryEvent } from 'microsoft.aspnetcore.razor.vscode/dist/HostEventStream';
import * as path from 'path';
import * as vscode from 'vscode';

let activationResolver: (value?: any) => void;
export const extensionActivated = new Promise(resolve => {
    activationResolver = resolve;
});

export async function activate(context: vscode.ExtensionContext) {
    // Because this extension is only used for local development and tests in CI,
    // we know the Razor Language Server is at a specific path within this repo
    const languageServerDir = path.join(
        __dirname, '..', '..', '..', 'src', 'Microsoft.AspNetCore.Razor.LanguageServer',
        'bin', 'Debug', 'netcoreapp2.0');

    if (!fs.existsSync(languageServerDir)) {
        throw new Error('The Razor Language Server project has not yet been built - '
            + `could not find ${languageServerDir}`);
    }

    const hostEventStream = {
        post: (event: any) => {
            if (event.constructor.name === TelemetryEvent.name) {
                console.log(`Telemetry Event: ${event.eventName}.`);
            } else {
                console.log(`Unknown event: ${event.eventName}`);
            }
        },
    };

    await razorExtensionPackage.activate(
        context,
        languageServerDir,
        hostEventStream);

    activationResolver();
}
