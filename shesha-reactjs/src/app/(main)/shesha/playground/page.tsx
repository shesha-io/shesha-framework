"use client";

import React, { useState } from 'react';
import { PageWithLayout } from '@/interfaces';
import UserDecisionEditor, { UserDecision } from './userDecisionEditor';

const Page: PageWithLayout<{}> = () => {
    const [value, setValue] = useState<UserDecision>(() => ({
        "uid": "RZM76FR9_ICgV_ZZ98C-U",
        "label": "Submit"
      }));
    return (
        <div>
            <h1>Playground</h1>
            <UserDecisionEditor
                onChange={setValue}
                value={value}
            />
        </div>
    );
};

export default Page;