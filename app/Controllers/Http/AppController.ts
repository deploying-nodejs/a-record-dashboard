import DigitalOcean from 'digitalocean'
import { schema, validator, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AppController {
    async store({ response, request, session }: HttpContextContract) {
        const recordSchema = validator.compile(schema.create({
            record: schema.string({}),
            ip: schema.string({}, [
                rules.ip({
                    version: '4'
                })
            ]),
            email: schema.string({}, [
                rules.email()
            ])
        }))
    
        await request.validate({
            schema: recordSchema,
            messages: {
                'email.required': 'Your email is required.',
                'record.required': 'Your a record is required.',
                'ip.required': 'The server ip address is required.',
                'email.email': 'Your email is invalid.',
                'ip.ip': 'The IP address must be a valid ipv4 address.',
            }
        })

        // first, validate that this email is enroled to the deploying-nodejs course. This would require
        // calling the thinkific API.

        // secondly, call the digital ocean API to add this a-record to the domain

        try {
            await this.addToDigitalOcean(request.all())
        } catch (error) {
            session.flash('error', error.message)

            return response.redirect('back')
        }

        // finally return redirect and flash success to the user.
        session.flash('success', 'Your subdomain record has been added.')

        return response.redirect('/')
    }

    async addToDigitalOcean({ record, ip }: any) {
        const client = DigitalOcean.client(process.env.DIGITAL_OCEAN_TOKEN)

        return client.domains.createRecord('deployingnodejs.com', {
            data: ip,
            // type: 'A',
            name: record
        })
    }
}
