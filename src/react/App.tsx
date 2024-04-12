import React, { useState } from 'react';
import "./style/index.css";

export default function App() {
    const [count, setCount] = useState(0);
    return (
        <html>
            <head>
                <title>Index Page</title>
            </head>
            <body>
                <div>
                    <h1>Index Page</h1>
                    <p>You clicked {count} times</p>

                    {/* @ts-ignore */}
                    <button onClick={() => {setCount(count + 1)}}>
                        Click me
                    </button>
                </div>
            </body>
        </html>

    );
}
