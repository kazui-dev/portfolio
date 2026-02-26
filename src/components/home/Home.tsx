export default function Home() {
    return (
        <>
            <h1 className="text-4xl font-bold mb-4">Welcome to My Portfolio</h1> 
            <p className="text-lg text-gray-700 dark:text-gray-300">
                This is the home page of my portfolio. Here you can find information about me, my projects, and how to contact me.
            </p>
            <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-2">About Me</h2>
                <p className="text-gray-700 dark:text-gray-300">
                    I am a passionate developer with experience in building web applications using modern technologies. I enjoy learning new things and taking on challenging projects.
                </p>
            </section>
            <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-2">Projects</h2>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    <li><a href="/projects/project1" className="text-blue-500 hover:underline">Project 1</a> - A web application for managing tasks.</li>
                    <li><a href="/projects/project2" className="text-blue-500 hover:underline">Project 2</a> - A mobile app for tracking fitness activities.</li>
                    <li><a href="/projects/project3" className="text-blue-500 hover:underline">Project 3</a> - An open-source library for data visualization.</li>
                </ul>
            </section>
            <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-2">Contact</h2>
                <p className="text-gray-700 dark:text-gray-300">
                    Feel free to reach out to me via email at <a href="mailto:kazui@example.com" className="text-blue-500 hover:underline">kazui@example.com</a>
                    or connect with me on <a href="https://www.linkedin.com/in/kazui" className="text-blue-500 hover:underline">LinkedIn</a>.
                </p>
            </section>
        </>
    )
}